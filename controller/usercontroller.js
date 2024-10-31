const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const verify = require('../middleware/verify');


router.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            console.log("Already Registered");
            return res.status(400).json({ message: "An account with same email aready exists" })
        }
        else {
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hash = await bcrypt.hash(req.body.password, salt);
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                password: hash,
                role: req.body.role
            })
            console.log("Successfull");
            return res.status(201).json({ user: user, message: "Your account has been created" })
        }
    } catch (error) {
        console.log(`Error!! ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const extuser = await User.findOne({ email });
        if (!extuser) {
            console.log("Not found");
            return res.status(400).json({ message: "Account not found" })
        }
        const comparepass = await bcrypt.compare(password, extuser.password);
        if (!comparepass) {
            return res.status(400).json({ message: "Wrong credentials" })
        }
        const accesstoken = jwt.sign({ id: extuser.id, role: extuser.role }, process.env.JWT_SEC, { expiresIn: "5d" });
        if (!accesstoken) {
            return res.status(401).json({ message: "Access Denied,token not generated" })
        }
        console.log("Logged In");
        res.cookie('userid',extuser.id,{ httpOnly: true, secure: true, maxAge: 5 * 24 * 60 * 60 * 1000 });
        return res.status(200).json({ token: accesstoken, userid: extuser._id, message: "You are logged in", role: extuser.role })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/myprofile', verify, async (req, res) => {
    try {
        const profile = await User.findById(req.user.id).select("-password -_id");
        if (!profile) {
            console.log("Not found");
            return res.status(404).json({ message: "Profile not found!" });
        }
        console.log("Found");
        return res.status(200).json({ profile: profile })
    } catch (error) {
        console.log(`Error!!${error}`)
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.delete('/delete/:id', verify, async (req, res) => {
    try {
        const profile = await User.findById(req.user.id).select("-password");
        if (!profile) {
            console.log("Not found");
            return res.status(404).json({ message: "Account not found" });
        }
        if (req.user.id === req.params.id) {
            const deleteprofile = await User.findByIdAndDelete(req.params.id);
            if (!deleteprofile) {
                return res.status(400).json({ message: "Account cannot be deleted,Please try again later" });
            }
            else {
                console.log("Deleted");
                return res.status(200).json({ message: "Account has been deleted successfully" });
            }
        }
        else {
            console.log("Wrong Account");
            return res.status(401).json({ message: "You can only delete your own account! Unauthorized access" })
        }
    } catch (error) {
        console.log(`Error!${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.put('/myprofile/update/:id', verify, async (req, res) => {
    if (req.user.id === req.params.id) {
        try {
            const update = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body
                },
                { new: true }

            )
            if (!update) {
                console.log("Update failed");
                return res.status(404).json({ message: "Your account can be updated at this time" })
            }
            console.log("Updated");
            return res.status(200).json({ message: "Your information has been updated succesfully" })
        } catch (error) {
            console.log(`Error!${error}`);
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }
    else {
        console.log("Not updated")
        return res.status(401).json({ message: "Access denied!!" })
    }
})

router.put('/myprofile/updatepassword/:id', verify, async (req, res) => {
    const { password } = req.body;
    if (req.user.id === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Could not find your account.!Redirecting!!" });
            }
            const compare = await bcrypt.compare(password, user.password);
            if (!compare) {
                return res.status(400).json({ message: "Your password did not match!!" });
            }
            const newpassword=req.body.newpassword;
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const passwordupdate = await bcrypt.hash(newpassword, salt)
            const update = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { password: passwordupdate }
                }
            )
            if (!update) {
                console.log("Update failed");
                return res.status(404).json({ message: "Your account cannot be updated at this time" })
            }
            console.log("Updated");
            return res.status(200).json({ message: "Your information has been updated succesfully" })
        } catch (error) {
            console.log(`Error!${error}`);
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }
    else {
        console.log("Not updated");
        return res.status(401).json({ message: "Access denied!!" })
    }
})

router.post('/logout', async (req, res) => {
    try {
        console.log("Logout successful")
        return res.clearCookie('userid').status(200).send("Logout Successful")
        
    } catch (error) {
        console.log(error)
        return res.status(500).send(`Internal Sever error${error}`)
       
    }
});



module.exports = router
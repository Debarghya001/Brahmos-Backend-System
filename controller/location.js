const express = require('express');
const router = express.Router();
const Location = require('../models/locationmodel');
const verify = require('../middleware/verify');


router.post('/addlocation', verify, async (req, res) => {
    try {
        if (req.user.role != 'Admin') {
            console.log("Cannot add");
            return res.status(402).json({ message: "Access denied!" })
        }
        const newlocation = await Location.create({
            name: req.body.name
        })
        if (!newlocation) {
            console.log("Cannot add");
            return res.status(400).json({ message: "Cannot add location" })
        }
        console.log("Added");
        return res.status(201).json({ location: newlocation, message: "Location added" })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.get('/findlocation', verify, async (req, res) => {
    try {
        const locationfetfch = await Location.find({});
        if (!locationfetfch) {
            console.log("Cannot Find");
            return res.status(404).json({ message: "Not Found" });
        }
        console.log("Found");
        return res.status(200).json({ fetch: locationfetfch, message: "Location Found" })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.delete('/deletelocation/:id',verify,async(req,res)=>{
    try {
        const locationfind=await Location.findById(req.params.id);
        if(!locationfind){
            console.log("Not found");
            return res.status(404).json({ message: "Location not found" });
        }
        const deletelocation = await Location.findByIdAndDelete(req.params.id);
            if (!deletelocation) {
                return res.status(400).json({ message: "Location cannot be deleted,Please try again later" });
            }
            else {
                console.log("Deleted");
                return res.status(200).json({ message: "Location has been deleted successfully" });
            }
    } catch (error) {
        console.log(`Error!${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

module.exports = router;
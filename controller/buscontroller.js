const express = require('express');
const router = express.Router();
const BusCreate = require('../models/buscreatemodel');
const verify = require('../middleware/verify');



router.post('/createbusroute', verify, async (req, res) => {
    const { BusType, Distance } = req.body;
    console.log("Received BusType:", BusType);
    const totalfarecalc = () => {
        let ratepkm;
        switch (BusType) {
            case 'Normal':
                ratepkm = 2
                break;
            case 'AC':
                ratepkm = 4
                break;
            case 'Ultra Luxury':
                ratepkm = 10
                break;
            case 'Sleeper':
                ratepkm = 12
                break;
            default:
                throw new Error('Invalid Bus Type')
        }
        return ratepkm * Distance
    }

    try {
        const numbercheck = await BusCreate.findOne({ BusNumber: req.body.BusNumber });
        if (req.user.role === !'Admin') {
            console.log("You are not an admin");
            res.status(401).json({ message: "Access Denied,Only admins are allowed !" });
        }
        if (numbercheck) {
            console.log("2 bus numbers cannot be same");
            return res.status(400).json({ message: "Bus with same Registration cannot be created" })
        }
        else {
            const newbus = await BusCreate.create({
                BusName: req.body.BusName,
                BusType: BusType,
                BusNumber: req.body.BusNumber,
                BoardingPoint: req.body.BoardingPoint,
                DroppingPoint: req.body.DroppingPoint,
                Distance: req.body.Distance,
                totalseats: req.body.totalseats,
                AvailableSeats: req.body.AvailableSeats,
                soldseats: req.body.soldseats,
                BusOwner: req.user.id,
                totalfare: totalfarecalc()
            })
            console.log(newbus);
            return res.status(201).json({ newbus: newbus, message: "Your Bus is registered under our travel." })
        }

    } catch (error) {
        console.log(`Error! ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/getallbuses', async (req, res) => {
    try {
        const allbus = await BusCreate.find({ isAvailable: true });
        if (allbus.length === 0) {
            return res.status(404).json({ message: "No available buses please try again latter!" })
        }
        console.log("Got it");
        return res.status(200).json({ AvailableBusses: allbus })
    } catch (error) {
        console.log(`Error! ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/searchbus', verify, async (req, res) => {
    try {
        const { BoardingPoint, DroppingPoint } = req.query;
        console.log("Received query parameters:", { BoardingPoint, DroppingPoint });
        if (!BoardingPoint || !DroppingPoint) {
            console.log("No Search field");
            return res.status(400).json({ message: "Search field cannot be empty" });
        }
        const busearch = await BusCreate.find({
            BoardingPoint: BoardingPoint,
            DroppingPoint: DroppingPoint,
        });
        
        if (busearch.length === 0) {
            console.log("Bus not found, please try again!");
            return res.status(404).json({ message: "Bus not found, please try again!" });
        }
        console.log("Found");
        return res.status(200).json({ fetchbus: busearch, message: "Bus Found" })
    } catch (error) {
        console.log(`Error! ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/mybus/:id', verify, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(401).json({ messgae: "Access Denied!!" })
        }
        const mybus = await BusCreate.find({ BusOwner: req.params.id });
        if (!mybus) {
            return res.status(404).json({ message: "No bus" });
        }
        console.log("Got")
        return res.status(200).json({ noofbus: mybus.length, mybus: mybus })
    } catch (error) {
        console.log(`Error! ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.delete('/deletebus/:name', verify, async (req, res) => {
    try {
        const busfind = await BusCreate.findOne({ BusName: req.params.name })

        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: "You are not an admin!" });
        }
        if (!busfind) {
            return res.status(404).json({ message: "Bus not found" });
        }
        console.log(busfind.BusOwner.toString())
        if (busfind.BusOwner.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const busdelete = await BusCreate.findByIdAndDelete(busfind._id);
        if (!busdelete) {
            console.log("Bus cannot be deleted.");
            return res.status(400).json({ message: "Bus cannot be deleted please try again later" })
        }
        console.log("Deleted!!!");
        return res.status(200).json({ message: "Your bus has been removed from listing" })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error!!" })
    }
})

router.delete('/alldeletebus/:ownerId', verify, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            console.log("401")
            return res.status(401).json({ message: "You are not an admin!" });
        }

        const buses = await BusCreate.find({ BusOwner: req.params.ownerId });

        if (buses.length === 0) {
            console.log("404")
            return res.status(404).json({ message: "No buses found for the specified owner" });
        }

        const deletePromises = buses.map(bus => BusCreate.findByIdAndDelete(bus._id));
        await Promise.all(deletePromises);

        console.log("All buses deleted!");
        return res.status(200).json({ message: "All buses owned by the specified owner have been removed from listing" });
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error!!" });
    }
});


module.exports = router;
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const verify = require('../middleware/verify');
const Booking = require('../models/bookingmodel');
const Buscreate = require('../models/buscreatemodel');
const User = require('../models/usermodel');


router.post('/booking', verify, async (req, res) => {
    try {
        const { seatnumber, busid, userName, email, bookingDate, age } = req.body;

        if (!Array.isArray(seatnumber) || seatnumber.length === 0) {
            return res.status(400).json({ message: "Invalid seatnumber or no seats selected" });
        }

        const busfind = await Buscreate.findById(busid);
        if (!busfind || busfind.isAvailable === 'false') {
            return res.status(404).json("Bus not available!");
        }

        const availableseat = new Set(busfind.AvailableSeats);
        const requiredseats = new Set(seatnumber);

        if (![...requiredseats].every(seat => availableseat.has(seat)) || seatnumber.length > 3) {
            return res.status(400).json({ message: "Seats not available or more than 3 seats cannot be booked" });
        }

        const existinbooking = await Booking.findOne({ userid: req.user.id, busid: busid });
        if (existinbooking) {
            return res.status(400).json({ message: "You have already booked a seat on this bus" });
        } else if (!existinbooking || existinbooking.isVerified === 'canceled') {
            const finalcalculation = busfind.totalfare * seatnumber.length;
            const booking = await Booking.create({
                userid: req.user.id,
                busid: busfind._id,
                busname: busfind.BusName,
                busnumber: busfind.BusNumber,
                userName: userName,
                email: email,
                age: age,
                seatnumber: seatnumber,
                busowner: busfind.BusOwner.toString(),
                boardingpoint: busfind.BoardingPoint,
                droppingpoint: busfind.DroppingPoint,
                totalfare: finalcalculation,
                bookingDate: bookingDate
            });

            await Buscreate.findByIdAndUpdate(req.body.busid, {
                $pull: { AvailableSeats: { $in: seatnumber } },
                $push: { soldseats: { $each: seatnumber } },
                $inc: { totalseats: -seatnumber.length }
            }, { new: true });

            return res.status(201).json({ booking: booking });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post('/calculateFareAndDetails', verify, async (req, res) => {
    try {
        const { seatnumber, busid } = req.body;

      
        if (!Array.isArray(seatnumber) || seatnumber.length === 0) {
            return res.status(400).json({ message: "Invalid seatnumber or no seats selected" });
        }

        const busfind = await Buscreate.findById(busid);
        if (!busfind || busfind.isAvailable === 'false') {
            return res.status(404).json("Bus not available!")
        }

        const availableseat = new Set(busfind.AvailableSeats);
        const requiredseats = new Set(seatnumber);

       
        if (![...requiredseats].every(seat => availableseat.has(seat)) || seatnumber.length > 3) {
            return res.status(400).json({ message: "Seats not available or more than 3 seats cannot be booked" });
        }

        
        const totalfare = busfind.totalfare * seatnumber.length;

        
        return res.status(200).json({
            totalfare,
            busname: busfind.BusName,
            busnumber: busfind.BusNumber,
            boardingpoint: busfind.BoardingPoint,
            droppingpoint: busfind.DroppingPoint
        });
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.put('/admin/mybookings/verifysale/:id', verify, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: "You are not authorized to do this" });
        }
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const bus = await Buscreate.findById(booking.busid);
        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        if (req.body.isVerified === "canceled") {
            bus.AvailableSeats = Array.isArray(bus.AvailableSeats) ? bus.AvailableSeats : [];
            const updatedAvailableSeats = [...bus.AvailableSeats, ...booking.seatnumber].sort((a, b) => a - b);

            bus.soldseats = Array.isArray(bus.soldseats) ? bus.soldseats : [];
            const updatedSoldSeats = bus.soldseats.filter(seat => !booking.seatnumber.includes(seat));

            await Buscreate.findByIdAndUpdate(booking.busid, {
                AvailableSeats: updatedAvailableSeats,
                soldseats: updatedSoldSeats,
                $inc: { totalseats: booking.seatnumber.length }
            });

            console.log("Booking canceled and seats updated");
            const verifybus = await Booking.findByIdAndUpdate(
                req.params.id,
                { $set: { isVerified: req.body.isVerified } },
                { new: true }
            );
            console.log("Booking verification updated");
            return res.status(200).json({ updated: verifybus });

        } else {
            const verifybus = await Booking.findByIdAndUpdate(
                req.params.id,
                { $set: { isVerified: req.body.isVerified } },
                { new: true }
            );
            console.log("Booking verification updated");
            return res.status(200).json({ updated: verifybus });
        }

        return res.status(200).json({ message: "Booking canceled successfully" });

    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/client/mybookings', verify, async (req, res) => {
    try {
        const bus = await Booking.find({ userid: req.user.id });
        if (!bus || bus.length === 0) {
            return res.status(404).json({ message: "Bus not found" });
        }
        console.log("Updated");
        return res.status(200).json({ Mybookings: bus })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.delete('/cancel/mybookings/:id', verify, async (req, res) => {
    try {
        
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

    
        if (booking.userid.toString() !== req.user.id) {
            return res.status(401).json({ message: "You are not authorized to delete this booking" });
        }

        
        const bus = await Buscreate.findById(booking.busid);
        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        
        bus.AvailableSeats = Array.isArray(bus.AvailableSeats) ? bus.AvailableSeats : [];

        
        const updatedAvailableSeats = [...bus.AvailableSeats, ...booking.seatnumber].sort((a, b) => a - b);

       
        const updatedSoldSeats = bus.soldseats.filter(seat => !booking.seatnumber.includes(seat));

     
        await Buscreate.findByIdAndUpdate(booking.busid, {
            AvailableSeats: updatedAvailableSeats,
            soldseats: updatedSoldSeats,
            $inc: { totalseats: booking.seatnumber.length }  
        });

        
        await Booking.findByIdAndDelete(req.params.id);

        console.log("Booking deleted and seats updated");
        return res.status(200).json({ message: "Booking canceled successfully" });
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/alldelete/:id', verify, async (req, res) => {
    try {
        const profile = await User.findById(req.user.id).select("-password");
        
        if (!profile) {
            console.log("Not found");
            return res.status(404).json({ message: "Account not found" });
        }

        let bookings;
        if (profile.role === 'Admin') {
            bookings = await Booking.find({ busowner: req.params.id });
        } else {
            bookings = await Booking.find({ userid: req.user.id });
        }

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this user" });
        }

        for (const booking of bookings) {
            const bus = await Buscreate.findById(booking.busid);
            if (bus) {
                bus.AvailableSeats = Array.isArray(bus.AvailableSeats) ? bus.AvailableSeats : [];
                const updatedAvailableSeats = [...bus.AvailableSeats, ...booking.seatnumber].sort((a, b) => a - b);
                const updatedSoldSeats = bus.soldseats.filter(seat => !booking.seatnumber.includes(seat));

                await Buscreate.findByIdAndUpdate(booking.busid, {
                    AvailableSeats: updatedAvailableSeats,
                    soldseats: updatedSoldSeats,
                    $inc: { totalseats: booking.seatnumber.length }
                });
            }
            await Booking.findByIdAndDelete(booking._id);
        }

        console.log("All bookings deleted and seats updated");
        return res.status(200).json({ message: "All bookings canceled successfully" });
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get('/admin/mybookings', verify, async (req, res) => {
    try {
        const bus = await Booking.find({ busowner: req.user.id });
        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: "You are not authorized to do this" })
        }
        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }
        
        return res.status(200).json({ Mybookings: bus })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.get('/admin/sales', verify, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: "You are not authorized to do this" })
        }
        const buses = await Booking.find({ busowner: req.user.id });
        if (!buses) {
            return res.status(404).json({ messgae: "Bus Not Found" })
        }
        let totalrevenue = 0;
        const busvalue = await Buscreate.find({ BusOwner: req.user.id });
        if (!busvalue) {
            return res.status(404).json({ messgae: "Bus Not Found" })
        }
        let totalseatnorsold = 0;
        let totalseatssold = 0;
        busvalue.forEach(bus => {
            totalseatnorsold += bus.totalseats || 0;
            totalseatssold += bus.soldseats.length || 0;    
        });
        buses.forEach(bus => {
            totalrevenue += Number(bus.totalfare) || 0;
        })
        console.log("Done");
        return res.status(200).json({ TotalseatsSold: totalseatssold, Notsold: totalseatnorsold, TotalRevenue: totalrevenue })
    } catch (error) {
        console.log(`Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

module.exports = router;
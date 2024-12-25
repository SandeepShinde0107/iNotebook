const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt=require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET= "Iamagoodboy";

//ROUTE1:   create a user using; POST "/api/auth/createuser" .No login required
router.post('/createuser', [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail(),
    body('password', 'enter a valid password of 5 characters').isLength({ min: 5 }),

], async (req, res) => {
    let success=false;
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success,  errors: errors.array() });
    }

    try {
        //    check whether  the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exits" })
        }
        // create a new user
        const salt= await bcrypt.genSalt(10);
       const  secPass= await bcrypt.hash(req.body.password, salt) ;

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data={
            user:{
                id:user.id
            }
        }
        // here it gives me a authtoken 
        const authtoken= jwt.sign(data , JWT_SECRET);

        success=true;
        res.json({success, authtoken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

//ROUTE2:   Authenticate a user using: POST "/api/auth/login".
router.post('/login', [
    body('email', 'enter a valid email').isEmail(),
    body('password', 'password cannot be blank').exists(),

], async (req, res) => {
     let success=false;
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password}=req.body;
    try{
        let user= await User.findOne({email});
        if(!user){
            success=false;  
            // here i have written this message because i dont want the hacker to kow that user does not exists here so this message is perfect to bluff him.
            return res.status(400).json({error:"please try to login with correct credentials"});
        }
    const passwordCompare= await bcrypt.compare(password, user.password);
    if(!passwordCompare){
        success=false;
        return res.status(400).json({success, error:"please try to login with correct credentials"});
    }
    const data={
        user:{
            id:user.id
        }
    }
    const authtoken=jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authtoken})
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error occured")
    }
})

// ROUTE3: get logged in user details using POST "/api/auth/getuser" Login required
router.post('/getuser',fetchuser, async(req,res)=>{

    try{
        userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router
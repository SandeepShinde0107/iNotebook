const express = require('express');
const router= express.Router()
const fetchuser= require('../middleware/fetchuser');
const Note=require("../models/Note");
const { body,validationResult } = require('express-validator');

// ROUTE1: Get all the notes using GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes',fetchuser, async (req,res)=>{
    try{
        const notes= await Note.find({user:req.user.id});
        res.json(notes);
     }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
     }
}) 

// ROUTE2: Add  all the notes using POST "/api/notes/addnote". Login required
router.post('/addnote',fetchuser,[
    body('title', 'enter a valid title').isLength({min:3}),
    body('description','Description must be atleast 5 characters').isLength({min:5}),], async (req,res)=>{
    
    try{
        
    // if there are errors return bad request and the errors
    const{title, description, tag}=req.body;
    const errors=validationResult(req);
    if(!errors.isEmpty){
        return res.status(400).json({errors:errors.array()});
    }
    const note = new Note({
        title, description, tag, user:req.user.id
    })
    const savedNote= await note.save()

    res.json(savedNote);
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
 }) 


// ROUTE 3: Update an existing note using PUT 'api/notes/updatenote'. Login required
router.put('/updatenote/:id',fetchuser, async(req,res)=>{
    const {title, description,tag}= req.body;
    // create a newNote object
    try{
    const newNote={};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    // find the note to be updated and update it
    let note= await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")};

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({note});
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing note using DELETE "/api/notes/deletenote/:id". Login required
router.delete('/deletenote/:id', fetchuser, async(req,res)=>{
try{
    // find the note to be deleted and delete it
    let note=await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")}

// Allow deletion only if user owns this note
    if(note.user.toString()!== req.user.id){
        return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({'Success':'Note has been deleted',note:note})
}catch(error){
    console.error(error.message);
res.status(500).send("Internal Server Error");
}
})


module.exports=router
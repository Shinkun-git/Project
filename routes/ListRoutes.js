const express = require('express');
const router = express.Router();

const User = require('../models/User')
const List = require('../models/List')

const { isLoggedin } = require('../utils/middleware')
const ExpressError = require('../utils/expressError')

router.get('/mylist', isLoggedin, async (req, res, next) => {
    const { _id } = req.user;
    const usr = await User.findById(_id).populate('BList')
    res.render('base/show', { usr })
})

router.post('/mylist', isLoggedin, async (req, res, next) => {
    const UserId = req.user._id;
    const { showID } = req.body;
    console.log(UserId)
    console.log(showID)
    const UpdatedUser = await User.findByIdAndUpdate( UserId, { $pull: { BList: showID } } , { new: true })
    await List.findByIdAndDelete(showID)
    console.log(UpdatedUser)
    req.flash('success', 'Successfully removed from Your list!!!')
    res.redirect('/lists/mylist')
})

router.post('/addList', isLoggedin, async (req, res, next) => {
    const { _id } = req.user;
    const PresentUsr = await User.findById(_id)
    const username = PresentUsr.username;
    const { retrieve } = req.body;
    const ParseData = JSON.parse(retrieve)
    const { id, name, status, officialSite, type, rating, genres, image } = ParseData.show

    let imgInsrt = 'defaultValue';
    let Rstatus = 'defaultValue';
    let officialUrl = 'defaultValue'
    let Rtype = type;

    if (rating.average == null) { rating.average = 0 }
    if (status == null) { Rtatus = 'N/A' } else { Rstatus = status }
    if (officialSite == null) { officialUrl = 'N/A' } else { officialUrl = officialSite }
    if (type == null) { Rtype = 'N/A' } else { Rtype = type }
    if (genres.length == 0) { genres.push('N/A') }
    if (!image) { imgInsrt = 'N/A' } else { imgInsrt = image.original; }

    const Rate = rating.average;
    const Gen = [...genres];

    const newList = await new List({
        user:username,
        id: id,
        name: name,
        status: Rstatus,
        image: imgInsrt,
        rating: Rate,
        Stype: Rtype,
        siteURL: officialUrl,
        genres: Gen
    })

    PresentUsr.BList.push(newList);
    await newList.save();
    await PresentUsr.save();

    req.flash('success' , `Added ${name} to your LIST`)
    res.redirect('/lists/mylist')
})

module.exports = router


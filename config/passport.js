const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const express = require('express');

module.exports = function(passport){
  // Local Strategy
  passport.use('login',new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {username:username};
    User.findOne(query, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'No user found'});
      }
      
      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) throw err;
        if (!user.isVerified) return done(null, false, { type: 'not-verified', message: 'Your account has not been verified.' }); 
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));
  passport.use('login-2fa',new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {username:username};
    User.findOne(query, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'No user found'});
      }
      
      // Match Password
      if (password!=user.password){
        return done(null, false, {message: 'Wrong password'});
      } else{
        return done(null, user);
      } 
      
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

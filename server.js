const express = require('express');
const app = express();
const passport = require('passport');
const crypto = require('crypto');

app.use(express.json());
app.use(express.urlencoded({extended : true}));

require('./config/passport');
app.use(passport.initialize());

app.use(routes);
app.listen(3000);
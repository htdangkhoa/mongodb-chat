//Declare modules and variables.
var bcrypt = require("bcrypt");
var uuid = require("node-uuid");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var salt_rounds = 10;

var avatar = "data:image/png;base64,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";

var User = new Schema({
	_id: {
		type: String,
		default: uuid.v4()
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "invisible"
    },
    friendList: {
        type: Array,
        default: []
    },
    messages: {
        type: Array,
        default: []  
    },
    avatar: {
        type: String,
        default: avatar
    }
});

User.pre("save", function(next) {
	var user = this;

	//Only hash the password if it has been modified (or is new).
    if (!user.isModified('password')) {
    	return next();
    }

    //Generate a salt.
    bcrypt.genSalt(salt_rounds, function(err, salt) {
        if (err) return next(err);

        //Hash the password using our new salt.
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            console.log(hash)
            //Override the cleartext password with the hashed one.
            user.password = hash;
            next();
        });
    });
});

User.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

//Export modules.
module.exports = mongoose.model("user", User);

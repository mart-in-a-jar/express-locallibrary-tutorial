const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
});

AuthorSchema.virtual("name").get(function () {
    // to handle cases where come fields are missing
    let fullName = "";
    if (this.first_name && this.family_name) {
        fullName = `${this.first_name} ${this.family_name}`;
    }

    return fullName;
});

AuthorSchema.virtual("url").get(function () {
    return `/catalog/author/${this._id}`;
});


module.exports = mongoose.model("authors", AuthorSchema);

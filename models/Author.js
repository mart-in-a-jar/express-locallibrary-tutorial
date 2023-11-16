const mongoose = require("mongoose");
const { DateTime } = require("luxon");

// referenced by:
// Book

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
        fullName = `${this.family_name}, ${this.first_name}`;
    }

    return fullName;
});

AuthorSchema.virtual("url").get(function () {
    return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("year_of_birth").get(function () {
    if (this.date_of_birth) {
        return this.date_of_birth.getFullYear();
    }
});

AuthorSchema.virtual("year_of_death").get(function () {
    if (this.date_of_death) {
        return this.date_of_death.getFullYear();
    }
});

AuthorSchema.virtual("lifespan").get(function () {
    const birthDate = this.date_of_birth
        ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(
              DateTime.DATE_MED
          )
        : "";
    const deathDate = this.date_of_death
        ? DateTime.fromJSDate(this.date_of_death).toLocaleString(
              DateTime.DATE_MED
          )
        : "";

    return `${birthDate ? birthDate + " - " : ""}${deathDate}`;
});

module.exports = mongoose.model("authors", AuthorSchema);

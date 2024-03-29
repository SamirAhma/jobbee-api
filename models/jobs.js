const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter Job title."],
    trim: true,
    maxlength: [100, "Job title can not exceed 100 characters."],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please enter Job description."],
    maxlength: [1000, "Job description can not exceed 1000 characters."],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please add a valid email address."],
  },
  address: {
    type: String,
    required: [true, "Please add an address."],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required: [true, "Please add a company name."],
  },
  industry: {
    type: [String],
    required: [true, "Please enter industry for this job"],
    enum: {
      values: [
        "Business",
        "Information Technology",
        "Banking",
        "Education/Training",
        "Telecommunication",
        "Others",
      ],
      message: "Please select correct option for industry.",
    },
  },
  jobType: {
    type: String,
    required: [true, "Please enter job type"],
    enum: {
      values: ["Permanent", "Temporary", "Internship"],
      message: "Please select correct options for job type",
    },
  },
  minEducation: {
    type: String,
    required: [true, "Please enter minimum education"],
    enum: {
      values: ["Bachelors", "Masters", "Phd"],
      message: "Please select correct options for education.",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: [true, "Please enter experience required for this job."],
    enum: {
      values: [
        "No Experience",
        "1 Year - 2 Years",
        "2 Year - 3 Years",
        "3 Year - 4 Years",
        "5 Years+",
      ],
      message: "Please select correct options for experience",
    },
  },
  salary: {
    type: Number,
    required: [true, "Please enter expected salary for this job."],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});

//Creating Job Slug before saving
jobSchema.pre("save", function (next) {
  //Creating slug before saving to DB
  this.slug = slugify(this.title, { lower: true });
  next();
});

jobSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);
  console.log(loc);
  this.location = {
    type: "Point",
    coordinates: [loc[1].longitude, loc[1].latitude],
    formattedAddress: loc[1].formattedAddress,
    city: loc[1].city,
    state: loc[1].state,
    zipcode: loc[1].zipcode,
    country: loc[1].country,
  };
});

module.exports = mongoose.model("Job", jobSchema);

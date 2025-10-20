const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: [true, 'Person name required']
    },
    number: {
        type: String,
        minlength: 8,
        required: [true, 'Person phone number required'],
        validate: {
            validator: v => /^(?:\d{3}-\d{5,}|\d{2}-\d{6,})$/.test(v),
            message: "Use the correct number format, e.g. 040-12345 or 09-123456", 
        }
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
// käytännössä sama kuin "import http from 'http'"
require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())

const morgan = require('morgan')

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: (req) => !['POST', 'PUT'].includes(req.method)
}))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', Object.keys(request.body || {}).length ? request.body : '-')
    console.log('---')
    next()
}

app.use(requestLogger)

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
        
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/info', async (request, response, next) => {
    try {
        const count = await Person.countDocuments({})
        // Näinkin voi tehdä
        response.send(`Phonebook has info for ${count} people <p>${new Date()}</p>`)
    } catch (error) { next(error) }
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    if (!name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
    
    Person.findOne({ name })
        .then(existing => {
            if (existing) {
                return res.status(400).json({ error: 'name must be unique!' })
            }
            const person = new Person({ name, number })
            return person.save().then(saved => response.json(saved))
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }

            person.name = name
            person.number = number
            
            return person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
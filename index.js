// käytännössä sama kuin "import http from 'http'"
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('dist'))

const cors = require('cors')

app.use(cors())

const morgan = require('morgan')

//app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(morgan(function(tokens, req, res) {
    const { name, number } = req.body || {}
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify({ name, number })
    ].join(' ')
}))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

let persons = [
  { id: "1",  name: "Arto Hellas",        number: "040-123001" },
  { id: "2",  name: "Matti Virtanen",     number: "040-123002" },
  { id: "3",  name: "Liisa Korhonen",     number: "040-123003" },
  { id: "4",  name: "Kalle Nieminen",     number: "040-123004" },
  { id: "5",  name: "Sari Laine",         number: "040-123005" },
  { id: "6",  name: "Juha Mäkelä",        number: "040-123006" },
  { id: "7",  name: "Anna Heikkinen",     number: "040-123007" },
  { id: "8",  name: "Jari Koskinen",      number: "040-123008" },
  { id: "9",  name: "Tiina Saarinen",     number: "040-123009" },
  { id: "10", name: "Pekka Hämäläinen",   number: "040-123010" },
  { id: "11", name: "Jonna Salminen",     number: "040-123011" },
  { id: "12", name: "Olli Rantanen",      number: "040-123012" },
  { id: "13", name: "Mika Lehtinen",      number: "040-123013" },
  { id: "14", name: "Emilia Kallio",      number: "040-123014" },
  { id: "15", name: "Antti Miettinen",    number: "040-123015" },
  { id: "16", name: "Noora Aalto",        number: "040-123016" },
  { id: "17", name: "Ville Vuorinen",     number: "040-123017" },
  { id: "18", name: "Marja Tervo",        number: "040-123018" },
  { id: "19", name: "Eero Ahonen",        number: "040-123019" },
  { id: "20", name: "Paula Jokinen",      number: "040-123020" },
  { id: "21", name: "Sami Parkkinen",     number: "040-123021" },
  { id: "22", name: "Heli Karjalainen",   number: "040-123022" },
  { id: "23", name: "Topi Seppälä",       number: "040-123023" },
  { id: "24", name: "Kaisa Peltonen",     number: "040-123024" },
  { id: "25", name: "Lauri Vainio",       number: "040-123025" }
]

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const howMany = persons.length
    const timeNDate = new Date().toString()
    response.send('Phonebook has info for ' + howMany + ' people' + '<p></p>' + timeNDate)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const randId = Math.floor(Math.random() * 1000)
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    
    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique!'
        })
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: randId.toString(),
    }
      
    persons = persons.concat(person)

    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
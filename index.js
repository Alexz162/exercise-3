require('dotenv').config()

const express = require('express');
const Person = require('./models/person')
const app = express();
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan('tiny')


app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people <br/> ${Date()}</p>`)
  })
})


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })

})


app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
});


app.put('/api/persons/:id', (request, response, next) => {
  const {name,number} = request.body;
  
  Person.findByIdAndUpdate(
    request.params.id, 
    {name,number}, 
    { new: true ,runValidators:true, context: 'query'}).then(result => {
    response.json(result)
  }).catch(error => next(error))
})


app.post('/api/persons/', (request, response,next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).send({ error: 'name or number not found' })
  }/**  else if (persons.some(p => p.name === body.name)) {
    return response.send({ error: 'name must be unique' })
  }*/
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT)
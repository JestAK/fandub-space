const express = require('express')
const app = express()
const port = 3000

const students = [
    { id: 0, name: 'Alice', group: "IM-32" },
    { id: 1, name: 'Bob', group: "IM-32" },
    { id: 2, name: 'Charlie', group: "IM-32" },
    { id: 3, name: 'David', group: "IM-32" },
    { id: 4, name: 'Eve', group: "IM-32" }
]

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Node.js server')
})

app.get('/students', (req, res) => {
    res.json(students)
})

app.post('/students', (req, res) => {
    const { name, group } = req.body;

    if (!name || !group) {
        return res.status(400).json({ error: 'no name or group or both' });
    }

    const newStudent = { id: students.length, name, group };
    students.push(newStudent);

    res.status(201).json(newStudent);
})

app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { name, group } = req.body;

    const student = students.find(s => s.id === parseInt(id));

    if (!student) {
        return res.status(404).json({ error: 'student not found' });
    }

    if (name) student.name = name;
    if (group) student.group = group;

    res.json(student);
})

app.delete('/students/:id', (req, res) => {
    const { id } = req.params;

    const index = students.findIndex(s => s.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: 'student not found' });
    }

    const deletedStudent = students.splice(index, 1);

    res.json(deletedStudent[0]);
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

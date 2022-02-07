import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).send("This is the mock server");
})
app.get('/api/', (req, res) => {
    res.status(200).send("This is the route for the further parts");
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server up and running");
})
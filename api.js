const express = require('express');
const app = express();
const path = require('path');

// Middleware pour parser le JSON
app.use(express.json());

// Variable simulée pour suivre le modèle chargé
let currentModel = null;

// Liste simulée de modèles disponibles
const dummyModels = ['model1', 'model2', 'model3'];

// Route pour lister les modèles
app.get('/models', (req, res) => {
    res.status(200).json({ models: dummyModels });
});

// Route pour supprimer un modèle
app.delete('/rm', (req, res) => {
    const { model } = req.body;
    if (!model) {
        return res.status(400).json({ error: 'Please specify a model.' });
    }
    if (!dummyModels.includes(model)) {
        return res.status(404).json({ error: `The model: ${model} cannot be found.` });
    }
    res.status(200).json({ message: `The model ${model} has been successfully deleted!` });
});

// Route pour "télécharger" un modèle (simulé)
app.post('/pull', (req, res) => {
    const { model } = req.body;
    if (!model) {
        return res.status(400).json({ error: 'Model not specified.' });
    }
    if (!model.includes('/')) {
        return res.status(400).json({ error: `Invalid path '${model}'` });
    }

    // Simulation d'un stream de progression
    res.setHeader('Content-Type', 'text/plain');
    res.write(`Downloading ${model} (100 MB)...\n`);
    setTimeout(() => res.write('25%\n'), 500);
    setTimeout(() => res.write('50%\n'), 1000);
    setTimeout(() => res.write('75%\n'), 1500);
    setTimeout(() => res.write('100%\n'), 2000);
    setTimeout(() => res.end(), 2100);
});

// Route pour charger un modèle
app.post('/load_model', (req, res) => {
    const { model_name } = req.body;
    if (!model_name) {
        return res.status(400).json({ error: 'Please enter the name of the model to be loaded.' });
    }
    if (currentModel) {
        return res.status(400).json({ error: 'A model is already loaded. Please unload it first.' });
    }
    currentModel = model_name;
    res.status(200).json({ message: `Model ${model_name} loaded successfully.` });
});

// Route pour décharger un modèle
app.post('/unload_model', (req, res) => {
    if (!currentModel) {
        return res.status(400).json({ error: 'No models are currently loaded.' });
    }
    currentModel = null;
    res.status(200).json({ message: 'Model successfully unloaded!' });
});

// Route pour récupérer le modèle actuel
app.get('/current_model', (req, res) => {
    if (currentModel) {
        return res.status(200).json({ model_name: currentModel });
    }
    res.status(404).json({ error: 'No models are currently loaded.' });
});

// Route pour générer une réponse (simulation)
app.post('/generate', (req, res) => {
    if (!currentModel) {
        return res.status(400).json({ error: 'No models are currently loaded.' });
    }
    const dummyResponse = `This is a dummy response from ${currentModel}.`;
    res.status(200).json({ response: dummyResponse });
});

// Route par défaut
app.get('/api/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to RKLLama Test API!',
        github: 'https://github.com/notpunhnox/rkllama'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

// Démarrage du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
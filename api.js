// Generate by Grok

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors())

// Middleware pour parser le JSON
app.use(express.json());

// Variable simulée pour suivre le modèle chargé
let currentModel = null;

// Liste simulée de modèles disponibles
const dummyModels = ['Llama3.2', 'Qwen2.5', 'Grok'];

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
    console.log(req.body)
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

    const { messages, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages must be provided as an array.' });
    }

    // Générer une réponse basée sur le dernier message utilisateur
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || 'No input';
    const dummyResponse = `This is a dummy response from ${currentModel} to: "${lastUserMessage}".`;
    const responseChunks = dummyResponse.split(' '); // Diviser en morceaux pour simuler le streaming

    // Métadonnées simulées
    const usage = {
        tokens_per_second: Math.floor(Math.random() * 50) + 50, // Entre 50 et 100
        completion_tokens: dummyResponse.split(' ').length
    };

    if (stream) {
        // Mode streaming
        res.setHeader('Content-Type', 'text/plain');

        let index = 0;
        const streamInterval = setInterval(() => {
            if (index < responseChunks.length) {
                const chunk = {
                    response: responseChunks[index] + ' ', // Structure adaptée au client
                    usage: index === responseChunks.length - 1 ? usage : { tokens_per_second: 0, completion_tokens: 0 }
                };
                res.write(JSON.stringify(chunk) + '\n');
                index++;
            } else {
                clearInterval(streamInterval);
                res.end();
            }
        }, 200); // Délai de 200ms entre chaque mot pour simuler une génération progressive
    } else {
        // Mode non-streaming
        res.status(200).json({
            response: dummyResponse,
            usage
        });
    }
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
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
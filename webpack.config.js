const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    
    // Le point d'entrée de ton app React
    .addEntry('app', './assets/App.tsx')

    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())

    // Activer React et TypeScript
    .enableReactPreset()
    .enableTypeScriptLoader((options) => {
        // On force la génération de fichiers pour Webpack
        // même si tsconfig.json dit "noEmit: true" (pour l'IDE)
        options.compilerOptions = {
            noEmit: false
        };
    })

     // OBLIGATOIRE pour le SASS
    .enableSassLoader()
;

module.exports = Encore.getWebpackConfig();

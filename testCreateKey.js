const ApiKey = require('../models/apiKey');
(async () => {
    try {
        const newKey = await ApiKey.create("Test API Key");
        console.log("✅ Created API Key:", newKey);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
})();

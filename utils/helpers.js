// utils/helpers.js

const axios = require('axios');
const { IPINFO_TOKEN } = require('../config/config');

const animalNames = [
    "Lion", "Tiger", "Panther", "Leopard", "Fox", "Wolf", "Bear", "Eagle", "Falcon", "Shark",
    "Dolphin", "Cheetah", "Otter", "Rabbit", "Turtle", "Hawk", "Moose", "Deer", "Seal", "Owl"
];

function generateRandomUsername() {
    const randomAnimal = animalNames[Math.floor(Math.random() * animalNames.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `${randomAnimal}${randomNumber}`;
}

function detectPersonalInfo(message) {
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const urlRegex = /(https?:\/\/[^\s]+)/i;

    return emailRegex.test(message) || phoneRegex.test(message) || urlRegex.test(message);
}

async function getLocationFromIp(ip) {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
        const { city, country } = response.data;
        return `${city || 'Unknown City'}, ${country || 'Unknown Country'}`;
    } catch (error) {
        console.error('Error fetching location:', error.message);
        return 'Unknown Location';
    }
}

module.exports = {
    generateRandomUsername,
    detectPersonalInfo,
    getLocationFromIp
};

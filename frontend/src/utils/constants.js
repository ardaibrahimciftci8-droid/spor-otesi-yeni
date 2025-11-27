// Turkey 81 Cities
export const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat",
  "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın",
  "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

import { Footprints, Activity, Zap, Dumbbell, Sparkles, ShoppingBag, Coffee, Smartphone, Headphones } from 'lucide-react';

// Activity Types
export const ACTIVITY_TYPES = [
  { id: 'running', name: 'Koşu', icon: Footprints, color: 'text-green-500', bg: 'bg-green-500/20' },
  { id: 'walking', name: 'Yürüyüş', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  { id: 'cycling', name: 'Bisiklet', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  { id: 'swimming', name: 'Yüzme', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/20' },
  { id: 'gym', name: 'Fitness', icon: Dumbbell, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  { id: 'yoga', name: 'Yoga', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-500/20' },
];

// Advertisement Data
export const ADS = [
  { id: 1, title: "Nike Air Max 2025", desc: "Yeni sezon spor ayakkabılar %30 indirimli!", icon: ShoppingBag, color: "from-orange-500 to-red-500" },
  { id: 2, title: "Protein Shop", desc: "En kaliteli supplementler uygun fiyatlarla", icon: Coffee, color: "from-green-500 to-emerald-500" },
  { id: 3, title: "FitWatch Pro", desc: "Akıllı saat ile antrenmanlarını takip et", icon: Smartphone, color: "from-blue-500 to-cyan-500" },
  { id: 4, title: "Premium Kulaklık", desc: "Spor yaparken müziğin tadını çıkar", icon: Headphones, color: "from-purple-500 to-pink-500" },
];

// Backend URL
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://sportsocial-3.preview.emergentagent.com";
export const API = `${BACKEND_URL}/api`;

// Firebase Config
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBzqEYs6V5oM2RLi1vOorMwgKDoOvqMmnI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sporotesi-a4ee9.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sporotesi-a4ee9",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sporotesi-a4ee9.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "715719411524",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:715719411524:web:ead6e98b58bf6c27bff911"
};

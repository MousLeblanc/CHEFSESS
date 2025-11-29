import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

async function checkTags() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    const recipes = await Recipe.find({});
    
    const withoutTags = recipes.filter(r => !r.tags || r.tags.length === 0);
    const withFewTags = recipes.filter(r => r.tags && r.tags.length < 3);
    const withManyTags = recipes.filter(r => r.tags && r.tags.length >= 5);
    
    console.log('📊 Statistiques des tags:');
    console.log(`   Total de recettes: ${recipes.length}`);
    console.log(`   Sans tags: ${withoutTags.length}`);
    console.log(`   Moins de 3 tags: ${withFewTags.length}`);
    console.log(`   5 tags ou plus: ${withManyTags.length}`);
    
    if (withoutTags.length > 0) {
      console.log('\n⚠️  Recettes sans tags:');
      withoutTags.slice(0, 10).forEach(r => console.log(`   - ${r.name}`));
    }
    
    if (withFewTags.length > 0) {
      console.log('\n⚠️  Recettes avec peu de tags (< 3):');
      withFewTags.slice(0, 10).forEach(r => console.log(`   - ${r.name} (${r.tags.length} tags)`));
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkTags();


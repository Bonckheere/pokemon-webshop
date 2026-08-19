import { db } from "./db";

const products = [
  { name: "Pikachu", type: "Electric", price: 2999, description: "The iconic Electric Mouse Pokémon. Cheerful, loyal, and always ready with a Thunderbolt.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
  { name: "Charmander", type: "Fire", price: 2499, description: "A Fire-type starter with a flame on its tail that shows its mood.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
  { name: "Bulbasaur", type: "Grass/Poison", price: 2499, description: "A Grass/Poison starter that carries a plant bulb on its back.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
  { name: "Squirtle", type: "Water", price: 2499, description: "A Water-type starter known for retreating into its shell.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
  { name: "Jigglypuff", type: "Normal/Fairy", price: 1999, description: "Sings a soothing melody that lulls listeners to sleep.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png" },
  { name: "Snorlax", type: "Normal", price: 4999, description: "Eats 400kg of food a day and then falls asleep.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" },
  { name: "Gengar", type: "Ghost/Poison", price: 3499, description: "Hides in shadows and loves to play tricks on people.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" },
  { name: "Eevee", type: "Normal", price: 2799, description: "An Evolution Pokémon with an unstable genetic makeup.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png" },
  { name: "Machop", type: "Fighting", price: 2199, description: "Trains constantly to build its already impressive muscles.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png" },
  { name: "Psyduck", type: "Water", price: 2199, description: "Constantly suffers from a headache that hides psychic powers.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png" },
  { name: "Mewtwo", type: "Psychic", price: 9999, description: "A Legendary Pokémon created through genetic manipulation.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png" },
  { name: "Dragonite", type: "Dragon/Flying", price: 7999, description: "Said to make its home somewhere in the sea and guide lost ships.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" },
  { name: "Vulpix", type: "Fire", price: 2299, description: "As it grows, it grows more of its beautiful six tails.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png" },
  { name: "Onix", type: "Rock/Ground", price: 2999, description: "As it grows, its body comes to resemble a series of huge rocks.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png" },
  { name: "Lapras", type: "Water/Ice", price: 4499, description: "A gentle Pokémon that ferries people across bodies of water.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png" },
  { name: "Gyarados", type: "Water/Flying", price: 5499, description: "Rarely seen in a docile state; famed for its rage and power.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png" },
];

const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };

if (count.c === 0) {
  const insert = db.prepare(
    "INSERT INTO products (name, type, price, description, image) VALUES (@name, @type, @price, @description, @image)"
  );
  const insertMany = db.transaction((rows: typeof products) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log("Products already seeded, skipping.");
}

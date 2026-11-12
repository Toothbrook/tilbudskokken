// 50 healthy dinners for the Tilbudskøkken bank. Grams are for the whole recipe at `base` portions.
// Check with: node scripts/check-recipes.mjs scripts/recipes/healthy-dinners.mjs
export default [
  // ================= fish & seafood =================
  { id: 'hd-fiskefrikadeller', type: 'dinner', main: 'carrot salad & dill sauce', pieces: [['fish cake', 'fish cakes'], 12, ['hvidfisk', 'log', 'aeg', 'mel', 'olie']],
    name: 'Fish cakes with potatoes & carrot salad', dk: 'Fiskefrikadeller med kartofler, gulerodssalat & dildskyr', base: 4, time: '45 min', tags: ['Danish classic', 'Lean'],
    ing: [['hvidfisk', 600], ['log', 100], ['aeg', 60], ['mel', 40], ['kartofler', 900], ['gulerod', 500], ['aeble', 150], ['agurk|salat', 300], ['citron', 100], ['skyr', 150], ['dild', 15], ['olie', 20], ['salt', 7], ['sortpeber', 1]],
    steps: ['Blend or finely chop the fish with the grated onion, egg, flour, salt and pepper to a firm mixture and chill 15 min.', 'Boil the potatoes in salted water, about 20 min.', 'Shape 12 fish cakes with a wet spoon and fry them in the oil on medium heat, 4 min per side.', 'Grate the carrots and apple, toss with the lemon juice and diced cucumber. Stir the skyr with chopped dill and a pinch of salt and serve alongside.'] },

  { id: 'hd-teriyaki-laks', type: 'dinner', main: 'salmon & vegetables', water: 50, leftovers: false,
    name: 'Teriyaki-style salmon with rice & greens', dk: 'Laks i soja-ingefærglace med ris, kål & broccoli', base: 4, time: '25 min', tags: ['Omega-3', 'Quick'],
    ing: [['laks', 500], ['ris', 280], ['kaal', 500], ['gulerod', 200], ['broccoli|frostgront|squash', 300], ['soja', 40], ['honning', 20], ['ingefaer', 20], ['hvidlog', 10], ['olie', 15], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water.', 'Stir the soy sauce, honey, grated ginger and garlic with 3 tbsp water.', 'Brown the salmon pieces skin-side down in half the oil for 4 min, turn, pour over half the sauce and cook 3 min until glossy.', 'Stir-fry the shredded cabbage, carrot strips and broccoli in the rest of the oil with the rest of the sauce for 4 min and serve with the salmon and rice.'] },

  { id: 'hd-thai-rejekarry', type: 'dinner', main: 'curry', leftovers: false,
    name: 'Thai-style shrimp & coconut curry', dk: 'Thailandsk karry med rejer, kokosmælk, basilikum & ris', base: 4, time: '25 min', tags: ['Quick', 'Thai'],
    ing: [['rejer|hvidfisk', 400], ['kokosmaelk', 400], ['peber', 300], ['squash|broccoli|frostgront', 300], ['log', 150], ['salat', 100], ['ingefaer', 20], ['hvidlog', 10], ['karry', 10], ['chiliflager', 2], ['citron', 100], ['basilikum', 20], ['soja', 20], ['olie', 10], ['ris', 280], ['salt', 3]],
    steps: ['Boil the rice in lightly salted water.', 'Fry the sliced onion, grated ginger and garlic in the oil for 3 min, then the karry and chili flakes for 1 min.', 'Add the coconut milk, soy sauce, pepper strips and squash and simmer 8 min.', 'Add the shrimp and spinach and heat 2–3 min. Finish with lemon juice and torn basil.'] },

  { id: 'hd-tunpasta', type: 'dinner', main: 'tuna pasta', mixed: true,
    name: 'Tuna & tomato pasta with lemon', dk: 'Fuldkornspasta med tun, tomat, citron & persille', base: 4, time: '25 min', tags: ['Cheap', 'Quick', 'Pantry'],
    ing: [['tun', 300], ['pasta', 350], ['hakkedetomater', 800], ['log', 150], ['squash|peber', 300], ['salat', 100], ['hvidlog', 10], ['citron', 100], ['persille', 25], ['chiliflager', 1], ['olie', 15], ['salt', 7], ['sortpeber', 1]],
    steps: ['Fry the chopped onion, garlic and diced squash in the oil for 5 min, add the chili flakes and tomatoes and simmer 10 min.', 'Boil the pasta in salted water.', 'Stir the drained tuna, spinach, lemon zest and juice into the sauce, season with salt and pepper, and toss with the pasta and chopped parsley.'] },

  { id: 'hd-fiskeplaki', type: 'dinner', main: 'fish & vegetables', roast: true, leftovers: false,
    name: 'Greek baked fish with tomatoes & potatoes', dk: 'Græsk ovnfisk (plaki) med tomat, løg & kartofler', base: 4, time: '50 min', tags: ['Greek', 'One tray', 'Lean'],
    ing: [['hvidfisk', 600], ['kartofler', 1000], ['log', 300], ['tomat', 400], ['hakkedetomater', 400], ['peber|squash', 300], ['hvidlog', 15], ['oregano', 3], ['citron', 100], ['persille', 20], ['olie', 30], ['salt', 8], ['sortpeber', 1]],
    steps: ['Heat the oven to 200°C. Toss sliced potatoes, onions and pepper with half the oil, salt and the oregano in a roasting dish and bake 25 min.', 'Stir the chopped tomatoes with the grated garlic and spread over the vegetables with the sliced fresh tomatoes.', 'Lay the fish on top, season with salt and pepper, drizzle with the rest of the oil and the lemon juice and bake 15–18 min until it flakes.', 'Scatter with chopped parsley.'] },

  { id: 'hd-makrelsalat', type: 'dinner', main: 'salad', mixed: true,
    name: 'Mackerel, potato & beetroot salad', dk: 'Salat med makrel i tomat, kartofler, rå rødbede & æg', base: 4, time: '35 min', tags: ['Nordic', 'Cheap', 'No oven'],
    ing: [['makreltomat|tun', 500], ['kartofler', 700], ['rodbeder', 400], ['agurk', 350], ['salat', 200], ['log', 100], ['aeg', 240], ['skyr', 200], ['sennep', 20], ['dild', 20], ['eddike', 15], ['salt', 5], ['sortpeber', 1]],
    steps: ['Boil the potatoes in salted water for 20 min and the eggs for 8 min; cool both and cut into chunks.', 'Slice the onion thinly and toss with the vinegar and a pinch of salt.', 'Stir the skyr with the mustard, chopped dill, salt and pepper.', 'Toss the lettuce, cucumber, grated raw beetroot, potatoes and onion, top with the mackerel and halved eggs, and spoon over the dressing.'] },

  { id: 'hd-torsk-sennep', type: 'dinner', main: 'fish & mustard sauce', leftovers: false,
    name: 'Poached cod with mustard sauce', dk: 'Pocheret torsk med sennepssauce, kartofler & gulerødder', base: 4, time: '35 min', tags: ['Danish classic', 'Lean'],
    ing: [['hvidfisk', 600], ['kartofler', 1000], ['gulerod', 400], ['broccoli|frostgront|porre', 400], ['maelk', 300], ['mel', 20], ['smor', 20], ['sennep', 30], ['persille', 20], ['salt', 8], ['sortpeber', 1]],
    steps: ['Boil the potatoes in salted water, and boil the carrots and broccoli alongside for the last 8 min.', 'Season the fish with salt and pepper and poach it in a pan of just-simmering salted water for 6–8 min.', 'Melt the butter, whisk in the flour, then the milk a little at a time. Simmer 3 min, stir in the mustard and season with salt.', 'Serve the fish with the sauce, potatoes and vegetables, scattered with parsley.'] },

  { id: 'hd-laks-tikka', type: 'dinner', main: 'salmon & roast cauliflower', leftovers: false,
    name: 'Tikka-spiced salmon with roast cauliflower', dk: 'Tikka-krydret laks med ovnbagt blomkål, yoghurt & ris', base: 4, time: '35 min', tags: ['Omega-3', 'Indian', 'One tray'],
    ing: [['laks', 500], ['blomkaal', 600], ['log', 200], ['tomat|peber', 300], ['salat', 100], ['yoghurt|skyr', 250], ['karry', 10], ['spidskommen', 4], ['paprika', 5], ['ingefaer', 15], ['hvidlog', 10], ['citron', 100], ['olie', 20], ['ris', 250], ['salt', 6]],
    steps: ['Heat the oven to 220°C. Toss cauliflower florets, onion wedges and halved tomatoes with half the oil, half the karry, the spidskommen and salt and roast 15 min.', 'Stir half the yoghurt with the paprika, the rest of the karry, grated ginger and garlic, the lemon juice and a pinch of salt, and coat the salmon in it.', 'Add the salmon to the tray and roast 12–14 min.', 'Boil the rice in lightly salted water and serve with the spinach and the rest of the yoghurt.'] },

  { id: 'hd-rejepaella', type: 'dinner', main: 'paella', mixed: true, water: 800, leftovers: false,
    name: 'Shrimp & vegetable paella', dk: 'Paella med rejer, peberfrugt, ærter & paprika', base: 4, time: '40 min', tags: ['Spanish', 'One pan'],
    ing: [['rejer', 400], ['ris', 300], ['peber', 300], ['log', 150], ['hakkedetomater', 400], ['frostgront|squash', 300], ['hvidlog', 15], ['paprika', 8], ['citron', 100], ['persille', 20], ['olie', 25], ['salt', 7]],
    steps: ['Fry the onion, garlic and diced pepper in the oil in a wide pan for 5 min, then stir in the paprika and rice for 1 min.', 'Add the tomatoes, 8 dl water and the salt and simmer uncovered, without stirring, for 15 min.', 'Press the shrimp and vegetables into the rice and cook 5–7 min more until the rice is tender and the liquid is gone.', 'Rest 5 min under a lid, scatter with parsley and serve with lemon wedges.'] },

  { id: 'hd-chermoula-fisk', type: 'dinner', main: 'fish & chickpeas', leftovers: false,
    name: 'Chermoula fish with chickpeas & bulgur', dk: 'Nordafrikansk fisk med chermoula, kikærter, tomat & bulgur', base: 4, time: '35 min', tags: ['North African', 'High protein'],
    ing: [['hvidfisk', 600], ['bonner', 400], ['hakkedetomater', 400], ['peber', 300], ['log', 150], ['gulerod', 200], ['persille', 30], ['hvidlog', 15], ['spidskommen', 5], ['paprika', 5], ['chiliflager', 1], ['citron', 100], ['olie', 25], ['bulgur', 200], ['salt', 7]],
    steps: ['Blend or finely chop the parsley with the garlic, spidskommen, paprika, chili flakes, lemon juice, half the oil and a pinch of salt to make the chermoula.', 'Fry the onion, pepper and grated carrot in the rest of the oil for 5 min, add the tomatoes and drained chickpeas and simmer 10 min. Season with salt.', 'Rub half the chermoula onto the fish, lay it on the sauce, cover and simmer gently 8 min until it flakes.', 'Cook the bulgur in lightly salted water as the pack says and serve with the rest of the chermoula.'] },

  // ================= vegetarian =================
  { id: 'hd-linsebolognese', type: 'dinner', main: 'pasta with lentil sauce', mixed: true, water: 400,
    name: 'Red lentil bolognese', dk: 'Fuldkornspasta med linsesovs, gulerod & champignon', base: 4, time: '35 min', tags: ['Vegetarian', 'Cheap', 'Freezes well'],
    ing: [['roedelinser', 200], ['pasta', 300], ['log', 150], ['gulerod', 300], ['champignon|squash', 300], ['hakkedetomater', 800], ['tomatpure', 30], ['hvidlog', 10], ['oregano', 2], ['ost', 40], ['olie', 15], ['salt', 7], ['sortpeber', 1]],
    steps: ['Fry the chopped onion, garlic, grated carrot and finely chopped mushrooms in the oil for 8 min.', 'Stir in the tomato paste and oregano, then the rinsed lentils, the tomatoes and 4 dl water. Simmer 20 min until thick and season with salt and pepper.', 'Boil the pasta in salted water, toss with the sauce and grate the cheese over.'] },

  { id: 'hd-gigantes', type: 'dinner', main: 'baked beans', sides: ['rugbrod'], water: 100,
    name: 'Greek baked beans with feta', dk: 'Græske ovnbagte bønner i tomat med spinat, feta & rugbrød', base: 4, time: '45 min', tags: ['Vegetarian', 'Greek', 'Cheap'],
    ing: [['bonner', 800], ['hakkedetomater', 800], ['log', 150], ['gulerod', 200], ['peber|squash', 300], ['salat', 150], ['hvidlog', 15], ['oregano', 3], ['persille', 20], ['feta', 150], ['olie', 30], ['rugbrod', 270], ['salt', 4], ['sortpeber', 1]],
    steps: ['Heat the oven to 190°C. Fry the onion, garlic, grated carrot and diced pepper in half the oil for 6 min.', 'Add the tomatoes, spinach, oregano, drained beans, 1 dl water, salt and pepper, and pour into an oven dish.', 'Crumble the feta on top, drizzle with the rest of the oil and bake 30 min.', 'Scatter with parsley and serve with rye bread.'] },

  { id: 'hd-ovnfalafel', type: 'dinner', main: 'salad & skyr sauce', pieces: [['falafel', 'falafel'], 20, ['bonner', 'log', 'hvidlog', 'persille', 'spidskommen', 'mel', 'bagepulver', 'olie']],
    name: 'Baked falafel with bulgur & salad', dk: 'Ovnbagte falafler med bulgur, salat & citronskyr', base: 4, time: '45 min', tags: ['Vegetarian', 'Middle Eastern'],
    ing: [['bonner', 800], ['log', 100], ['hvidlog', 10], ['persille', 40], ['spidskommen', 6], ['mel', 40], ['bagepulver', 4], ['olie', 30], ['bulgur', 200], ['tomat', 300], ['agurk', 350], ['salat|kaal', 200], ['skyr|yoghurt', 250], ['citron', 100], ['salt', 6]],
    steps: ['Heat the oven to 220°C. Blend or mash the drained chickpeas with the onion, garlic, half the parsley, the spidskommen, flour, baking powder and half the salt to a coarse paste.', 'Shape 20 balls, flatten them slightly, brush with the oil on a lined tray and bake 25 min, turning halfway.', 'Cook the bulgur in lightly salted water. Chop the tomato, cucumber and lettuce and toss with the rest of the parsley and half the lemon juice.', 'Stir the skyr with the rest of the lemon and a pinch of salt and serve everything together.'] },

  { id: 'hd-harira', type: 'dinner', main: 'soup', mixed: true, soup: true, water: 1500, sides: ['rugbrod'],
    name: 'Harira lentil & chickpea soup', dk: 'Marokkansk harira med linser, kikærter & rugbrød', base: 4, time: '40 min', tags: ['Vegetarian', 'North African', 'Freezes well'],
    ing: [['roedelinser', 200], ['bonner', 400], ['hakkedetomater', 400], ['log', 150], ['gulerod', 300], ['squash|peber', 300], ['tomatpure', 30], ['hvidlog', 10], ['ingefaer', 15], ['spidskommen', 5], ['kanel', 2], ['paprika', 5], ['persille', 30], ['citron', 100], ['olie', 15], ['rugbrod', 180], ['salt', 8], ['sortpeber', 1]],
    steps: ['Fry the onion, garlic, grated ginger and diced carrot in the oil for 5 min. Add the spidskommen, cinnamon, paprika and tomato paste for 1 min.', 'Add the rinsed lentils, tomatoes, diced squash, drained chickpeas and 1.5 l water and simmer 25 min.', 'Season with salt, pepper and lemon juice, stir in the chopped parsley and serve with rye bread.'] },

  { id: 'hd-bonneris', type: 'dinner', main: 'rice & beans', mixed: true, water: 600,
    name: 'Mexican bean & corn rice skillet', dk: 'Mexicansk risret med bønner, majs, peberfrugt & avocado', base: 4, time: '35 min', tags: ['Vegetarian', 'Mexican', 'One pan'],
    ing: [['bonner', 600], ['ris', 250], ['majs', 300], ['peber', 300], ['log', 150], ['hakkedetomater', 400], ['tomat', 200], ['avocado', 150], ['citron', 100], ['skyr', 150], ['ost', 60], ['hvidlog', 10], ['spidskommen', 5], ['paprika', 8], ['chiliflager', 1], ['olie', 15], ['salt', 7]],
    steps: ['Fry the onion, garlic and diced pepper in the oil for 5 min, then stir in the spidskommen, paprika, chili flakes and rice.', 'Add the tomatoes, 6 dl water and the salt, cover and simmer 15 min.', 'Stir in the drained beans and corn, top with the grated cheese, cover and leave 5 min off the heat.', 'Dice the avocado and fresh tomatoes with the lemon juice and a pinch of salt, and serve on top with skyr.'] },

  { id: 'hd-minestrone', type: 'dinner', main: 'soup', mixed: true, soup: true, water: 1500, sides: ['rugbrod'],
    name: 'Minestrone with beans & pasta', dk: 'Italiensk grøntsagssuppe med bønner, kål & fuldkornspasta', base: 4, time: '40 min', tags: ['Vegetarian', 'Italian', 'Cheap'],
    ing: [['bonner', 400], ['pasta', 150], ['log', 150], ['gulerod', 300], ['squash', 300], ['kaal', 300], ['hakkedetomater', 400], ['hvidlog', 10], ['oregano', 2], ['basilikum', 20], ['ost', 60], ['olie', 20], ['rugbrod', 180], ['salt', 8], ['sortpeber', 1]],
    steps: ['Fry the onion, garlic and diced carrot in the oil for 5 min.', 'Add the diced squash, shredded cabbage, tomatoes, oregano and 1.5 l water and simmer 15 min.', 'Add the pasta and drained beans and simmer 10 min more until the pasta is tender. Season with salt and pepper.', 'Serve with torn basil, grated cheese and rye bread.'] },

  { id: 'hd-blomkaalbakke', type: 'dinner', main: 'roast cauliflower & chickpeas',
    name: 'Roast cauliflower & chickpeas with garlic skyr', dk: 'Ovnbagt blomkål & kikærter med hvidløgsskyr, mandler & bulgur', base: 4, time: '40 min', tags: ['Vegetarian', 'One tray', 'Middle Eastern'],
    ing: [['blomkaal', 800], ['bonner', 400], ['log', 200], ['peber', 300], ['bulgur', 200], ['persille', 30], ['skyr|yoghurt', 250], ['citron', 100], ['noedder', 40], ['hvidlog', 10], ['spidskommen', 5], ['paprika', 5], ['olie', 30], ['salt', 7]],
    steps: ['Heat the oven to 220°C. Toss cauliflower florets, drained chickpeas, onion wedges and pepper strips with the oil, spidskommen, paprika and salt, and roast 30 min.', 'Cook the bulgur in lightly salted water as the pack says, and stir in the chopped parsley and half the lemon juice.', 'Stir the skyr with grated garlic, the rest of the lemon and a pinch of salt.', 'Chop the nuts, scatter them over the tray and serve with the bulgur and garlic skyr.'] },

  { id: 'hd-fetapasta', type: 'dinner', main: 'feta pasta', mixed: true,
    name: 'Baked feta & tomato pasta with beans', dk: 'Ovnbagt feta med tomater, spinat, bønner & fuldkornspasta', base: 4, time: '35 min', tags: ['Vegetarian', 'Italian'],
    ing: [['pasta', 350], ['feta', 200], ['bonner', 400], ['tomat', 600], ['peber|squash', 300], ['salat', 200], ['log', 100], ['hvidlog', 15], ['oregano', 2], ['chiliflager', 1], ['basilikum', 20], ['olie', 25], ['salt', 4], ['sortpeber', 1]],
    steps: ['Heat the oven to 200°C. Put the feta in the middle of an oven dish with halved tomatoes, diced pepper, sliced onion and garlic around it. Drizzle with the oil and season with oregano, chili flakes and black pepper.', 'Bake 25 min until the tomatoes burst.', 'Boil the pasta in salted water.', 'Mash the feta and tomatoes into a sauce, stir in the spinach and drained beans until wilted, then toss with the pasta and torn basil.'] },

  { id: 'hd-kokossuppe', type: 'dinner', main: 'noodle soup', mixed: true, soup: true, water: 1000, leftovers: false,
    name: 'Coconut, mushroom & noodle soup with egg', dk: 'Thailandsk kokossuppe med champignon, nudler & æg', base: 4, time: '30 min', tags: ['Vegetarian', 'Thai'],
    ing: [['nudler', 200], ['kokosmaelk', 400], ['champignon', 400], ['peber', 150], ['kaal|salat', 300], ['gulerod', 200], ['aeg', 240], ['ingefaer', 25], ['hvidlog', 10], ['citron', 100], ['soja', 30], ['chiliflager', 1], ['basilikum', 15], ['olie', 10], ['salt', 3]],
    steps: ['Boil the eggs for 7 min, cool and peel them.', 'Fry the sliced mushrooms, grated ginger and garlic in the oil for 4 min.', 'Add the coconut milk, 1 l water, soy sauce, chili flakes, carrot strips and sliced pepper and simmer 8 min.', 'Add the noodles and shredded cabbage and simmer 4 min. Season with lemon juice and salt.', 'Serve in bowls topped with the halved eggs and basil.'] },

  { id: 'hd-roedbedeboffer', type: 'dinner', main: 'salad & dill skyr', pieces: [['patty', 'patties'], 8, ['rodbeder', 'havregryn', 'aeg', 'log', 'feta', 'olie']],
    name: 'Beetroot & feta patties with potatoes', dk: 'Rødbedebøffer med feta, kartofler, agurkesalat & dildskyr', base: 4, time: '45 min', tags: ['Vegetarian', 'Nordic'],
    ing: [['rodbeder', 400], ['havregryn', 120], ['aeg', 120], ['log', 100], ['feta', 100], ['kartofler', 800], ['agurk', 350], ['salat', 200], ['skyr', 200], ['dild', 20], ['olie', 25], ['salt', 6], ['sortpeber', 1]],
    steps: ['Grate the raw beetroot and onion, squeeze out some juice, and mix with the oats, eggs, crumbled feta, salt and pepper. Rest 10 min.', 'Boil the potatoes in salted water.', 'Shape 8 patties and fry them in the oil on medium heat, 4–5 min per side.', 'Stir the skyr with chopped dill and a pinch of salt, and serve with the potatoes and a cucumber and lettuce salad.'] },

  { id: 'hd-garbanzos', type: 'dinner', main: 'chickpea stew', sides: ['rugbrod'], water: 100,
    name: 'Spanish chickpea & spinach stew', dk: 'Spansk gryde med kikærter, spinat, paprika & æg', base: 4, time: '30 min', tags: ['Vegetarian', 'Spanish', 'Cheap'],
    ing: [['bonner', 800], ['salat', 400], ['hakkedetomater', 400], ['log', 150], ['peber', 150], ['aeg', 240], ['hvidlog', 15], ['paprika', 8], ['spidskommen', 5], ['eddike', 10], ['olie', 30], ['rugbrod', 180], ['salt', 6], ['sortpeber', 1]],
    steps: ['Fry the onion, garlic and diced pepper in the oil for 5 min, then stir in the paprika and spidskommen for 30 sec.', 'Add the tomatoes, drained chickpeas and 1 dl water and simmer 10 min. Stir in the spinach a handful at a time until wilted.', 'Season with the vinegar, salt and pepper. Boil the eggs for 8 min, halve them and serve on the stew with rye bread.'] },

  { id: 'hd-svampestroganoff', type: 'dinner', main: 'stroganoff', water: 150,
    name: 'Mushroom & bean stroganoff', dk: 'Stroganoff med champignon, bønner, paprika & ris', base: 4, time: '30 min', tags: ['Vegetarian', 'Quick'],
    ing: [['champignon', 600], ['bonner', 400], ['log', 200], ['cremefraiche', 150], ['tomatpure', 30], ['sennep', 15], ['paprika', 8], ['hvidlog', 10], ['persille', 20], ['ris', 250], ['broccoli|frostgront', 400], ['olie', 15], ['salt', 6], ['sortpeber', 1]],
    steps: ['Fry the sliced mushrooms in the oil on high heat for 6 min until browned, then add the onion and garlic for 3 min.', 'Stir in the paprika and tomato paste, then the drained beans, creme fraiche, mustard and 1.5 dl water. Simmer 8 min and season with salt and pepper.', 'Boil the rice and broccoli in lightly salted water and serve with parsley on top.'] },

  { id: 'hd-linsepie', type: 'dinner', main: 'pie', mixed: true, water: 300,
    name: 'Lentil cottage pie with carrot mash', dk: 'Linsetærte uden dej: linser i tomat under kartoffel-gulerodsmos', base: 4, time: '1 t', tags: ['Vegetarian', 'Freezes well'],
    ing: [['roedelinser', 200], ['kartofler', 700], ['gulerod', 500], ['log', 150], ['champignon|squash', 250], ['hakkedetomater', 400], ['tomatpure', 30], ['timian', 2], ['hvidlog', 10], ['soja', 15], ['maelk', 150], ['smor', 15], ['ost', 40], ['olie', 15], ['salt', 6], ['sortpeber', 1]],
    steps: ['Boil the potatoes and half the carrots in salted water for 20 min, then mash with the milk, butter, salt and pepper.', 'Fry the onion, garlic, the rest of the carrots diced and the mushrooms in the oil for 6 min. Add the tomato paste, thyme, rinsed lentils, tomatoes, soy sauce and 3 dl water and simmer 15 min.', 'Heat the oven to 200°C. Spread the lentils in a dish, top with the mash and grated cheese and bake 20 min until golden.'] },

  // ================= eggs =================
  { id: 'hd-aeggekarry', type: 'dinner', main: 'curry', pieces: [['egg', 'eggs'], 8, ['aeg']],
    name: 'Indian egg curry with spinach', dk: 'Indisk æggekarry med tomat, spinat, blomkål & ris', base: 4, time: '35 min', tags: ['Vegetarian', 'Indian', 'Cheap'],
    ing: [['aeg', 480], ['hakkedetomater', 800], ['log', 200], ['blomkaal|broccoli|frostgront', 400], ['salat', 200], ['yoghurt', 150], ['hvidlog', 15], ['ingefaer', 20], ['karry', 10], ['spidskommen', 4], ['chiliflager', 1], ['persille', 20], ['ris', 250], ['olie', 20], ['salt', 6]],
    steps: ['Boil the eggs for 9 min, cool and peel them.', 'Fry the onion, garlic and grated ginger in the oil for 5 min, then the karry, spidskommen and chili flakes for 1 min.', 'Add the tomatoes and cauliflower florets and simmer 15 min. Stir in the spinach and yoghurt, season with salt and add the halved eggs to heat through.', 'Boil the rice in lightly salted water and serve with chopped parsley.'] },

  { id: 'hd-tomataeg', type: 'dinner', main: 'tomato & egg', water: 50, leftovers: false,
    name: 'Chinese tomato & egg stir-fry', dk: 'Kinesisk tomat-æggewok med ris & broccoli', base: 4, time: '20 min', tags: ['Vegetarian', 'Quick', 'Cheap'],
    ing: [['aeg', 480], ['tomat', 800], ['log', 150], ['broccoli|kaal|frostgront', 400], ['hvidlog', 10], ['ingefaer', 10], ['soja', 30], ['honning', 10], ['olie', 25], ['ris', 280], ['salt', 3]],
    steps: ['Boil the rice in lightly salted water.', 'Beat the eggs with a pinch of salt and scramble them softly in half the oil; take them out while still soft.', 'Fry the onion, garlic and ginger in the rest of the oil, add the tomato wedges and broccoli, the soy sauce, honey and 3 tbsp water and cook 4 min until saucy.', 'Fold the eggs back in and serve with the rice.'] },

  { id: 'hd-okonomiyaki', type: 'dinner', main: 'pancakes', mixed: true, water: 120, leftovers: false, pieces: [['pancake', 'pancakes'], 8, ['kaal', 'gulerod', 'aeg', 'mel', 'porre', 'olie']],
    name: 'Okonomiyaki cabbage pancakes', dk: 'Japanske kålpandekager med æg, porre & tomat-sojasauce', base: 4, time: '35 min', tags: ['Vegetarian', 'Japanese', 'Cheap'],
    ing: [['kaal', 600], ['gulerod', 200], ['porre', 150], ['aeg', 360], ['mel', 200], ['agurk|salat', 300], ['skyr', 150], ['tomatpure', 20], ['soja', 30], ['honning', 10], ['olie', 25], ['salt', 3]],
    steps: ['Whisk the flour, eggs, a pinch of salt and 1 dl water to a thick batter, then fold in the finely shredded cabbage, grated carrot and sliced leek.', 'Fry 8 small pancakes in the oil on medium heat, 4 min per side, until golden and cooked through.', 'Stir the tomato paste with the soy sauce, honey and 1 tbsp water for a sauce.', 'Serve the pancakes with the sauce, a spoon of skyr and the sliced cucumber.'] },

  // ================= chicken =================
  { id: 'hd-shawarma', type: 'dinner', main: 'chicken & salad',
    name: 'Chicken shawarma with bulgur salad', dk: 'Ovnbagt kyllingeshawarma med bulgursalat & hvidløgsskyr', base: 4, time: '45 min', tags: ['High protein', 'Middle Eastern'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['log', 100], ['bulgur', 240], ['tomat', 300], ['agurk', 350], ['salat|kaal', 200], ['persille', 30], ['skyr', 200], ['citron', 100], ['hvidlog', 10], ['spidskommen', 5], ['paprika', 5], ['kanel', 1], ['olie', 25], ['salt', 7]],
    steps: ['Toss the chicken strips with the spidskommen, paprika, cinnamon, half the garlic, half the lemon juice, half the oil and salt, and leave 15 min.', 'Heat the oven to 220°C. Spread the chicken and onion wedges on a tray and roast 18–20 min until charred at the edges.', 'Cook the bulgur in lightly salted water, then toss with chopped tomato, cucumber, lettuce, parsley, the rest of the oil and lemon.', 'Stir the skyr with the rest of the garlic and a pinch of salt and serve.'] },

  { id: 'hd-padkrapao', type: 'dinner', main: 'chicken & vegetables', water: 50, leftovers: false,
    name: 'Thai basil chicken with fried egg', dk: 'Pad kra pao: hakket kylling med basilikum, ris & spejlæg', base: 4, time: '25 min', tags: ['Thai', 'Quick', 'High protein'],
    ing: [['kyllingfars|kyllingebryst', 500], ['peber', 300], ['log', 150], ['broccoli|frostgront|squash', 300], ['agurk', 350], ['aeg', 240], ['basilikum', 30], ['hvidlog', 15], ['chiliflager', 2], ['soja', 40], ['honning', 10], ['olie', 25], ['ris', 280], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water.', 'Stir-fry the garlic, chili flakes and sliced onion in most of the oil for 1 min, add the chicken and fry on high heat until browned, 5 min.', 'Add the pepper strips and broccoli, the soy sauce, honey and 3 tbsp water and toss 3 min. Stir in the basil.', 'Fry the eggs in the rest of the oil and serve on the rice with the sliced cucumber.'] },

  { id: 'hd-tikkamasala', type: 'dinner', main: 'curry',
    name: 'Lean chicken tikka masala', dk: 'Kylling tikka masala med skyr, tomat, blomkål & ris', base: 4, time: '45 min', tags: ['Indian', 'High protein', 'Meal prep'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['skyr|yoghurt', 250], ['hakkedetomater', 800], ['log', 200], ['blomkaal|broccoli|frostgront', 400], ['tomatpure', 30], ['hvidlog', 15], ['ingefaer', 20], ['karry', 10], ['paprika', 5], ['spidskommen', 4], ['kanel', 1], ['olie', 20], ['ris', 250], ['salt', 7]],
    steps: ['Coat the chicken pieces in half the skyr with half the karry, the paprika and salt, and leave 15 min.', 'Brown the chicken in half the oil in a hot pan, 5 min, and take it out.', 'Fry the onion, garlic and grated ginger in the rest of the oil for 5 min, add the rest of the karry, the spidskommen, cinnamon and tomato paste, then the tomatoes and cauliflower. Simmer 12 min.', 'Return the chicken and simmer 5 min, then take off the heat and stir in the rest of the skyr. Boil the rice in lightly salted water and serve.'] },

  { id: 'hd-citronkylling', type: 'dinner', main: 'vegetables & Greek salad', roast: true, water: 100, pieces: [['chicken leg', 'chicken legs'], 4],
    name: 'Greek lemon-oregano chicken & potatoes', dk: 'Græsk citronkylling med oregano, kartofler & bondesalat', base: 4, time: '1 t', tags: ['Greek', 'One tray'],
    ing: [['kyllingelaar', 900], ['kartofler', 800], ['log', 200], ['peber|squash', 300], ['agurk', 350], ['tomat', 300], ['feta', 100], ['citron', 200], ['hvidlog', 15], ['oregano', 4], ['olie', 25], ['salt', 8], ['sortpeber', 1]],
    steps: ['Heat the oven to 200°C. Toss potato wedges, onion and pepper in a roasting tin with half the oil, the oregano, salt, the juice of one lemon and 1 dl water.', 'Rub the chicken legs with the rest of the oil, the grated garlic, salt and pepper and lay them on top, skin up.', 'Roast 50 min until the skin is crisp and the potatoes have soaked up the juices.', 'Chop the cucumber and tomato, top with crumbled feta and a squeeze of the second lemon, and serve alongside.'] },

  { id: 'hd-kyllingtinga', type: 'dinner', main: 'chicken, beans & slaw', water: 100,
    name: 'Chicken tinga bowls', dk: 'Mexicansk trukket kylling i krydret tomat med ris, bønner, kålsalat & avocado', base: 4, time: '40 min', tags: ['Mexican', 'High protein'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['hakkedetomater', 400], ['log', 200], ['bonner', 400], ['kaal', 300], ['avocado', 150], ['citron', 100], ['skyr', 100], ['hvidlog', 10], ['paprika', 8], ['spidskommen', 3], ['oregano', 2], ['chiliflager', 2], ['olie', 20], ['ris', 250], ['salt', 8]],
    steps: ['Fry the sliced onion and garlic in the oil for 5 min, add the paprika, spidskommen, oregano and chili flakes, then the tomatoes and 1 dl water. Add the chicken whole, cover and simmer 15 min.', 'Shred the chicken in the sauce with two forks and season with salt.', 'Boil the rice in lightly salted water and warm the drained beans with a pinch of salt.', 'Shred the cabbage finely and toss with the lemon juice and a pinch of salt. Serve with diced avocado and skyr.'] },

  { id: 'hd-satay', type: 'dinner', main: 'chicken & salad',
    name: 'Chicken satay with peanut sauce', dk: 'Kyllingesatay med peanutsauce, ris & sprød agurkesalat', base: 4, time: '35 min', tags: ['High protein', 'Thai'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['peanutbutter', 80], ['kokosmaelk', 200], ['agurk', 350], ['gulerod', 200], ['kaal', 300], ['soja', 30], ['honning', 10], ['karry', 5], ['hvidlog', 10], ['ingefaer', 15], ['citron', 100], ['eddike', 20], ['olie', 15], ['ris', 220], ['salt', 3]],
    steps: ['Toss the chicken strips with half the soy sauce, the karry and the grated garlic and ginger, and leave 15 min.', 'Boil the rice in lightly salted water. Fry the chicken in the oil on high heat, 6–7 min until golden.', 'Warm the peanut butter with the coconut milk, the rest of the soy sauce, the honey and the lemon juice, stirring until smooth.', 'Toss the sliced cucumber, grated carrot and shredded cabbage with the vinegar and a pinch of salt, and serve everything with the sauce.'] },

  { id: 'hd-kungpao', type: 'dinner', main: 'stir-fry', water: 60,
    name: 'Kung pao-style chicken', dk: 'Kinesisk wok med kylling, peberfrugt, nødder & ris', base: 4, time: '30 min', tags: ['Chinese', 'Quick'],
    ing: [['kyllingebryst|kyllingelaar', 500], ['peber', 300], ['squash|broccoli', 300], ['kaal', 200], ['log', 150], ['noedder', 60], ['hvidlog', 15], ['ingefaer', 20], ['chiliflager', 2], ['soja', 40], ['eddike', 20], ['honning', 15], ['mel', 10], ['olie', 25], ['ris', 250], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water. Toss the chicken cubes with half the soy sauce and the flour.', 'Stir the rest of the soy sauce with the vinegar, honey and 4 tbsp water.', 'Stir-fry the chicken in the oil on high heat for 5 min, add the chili flakes, garlic, ginger, onion and diced vegetables and fry 4 min more.', 'Pour in the sauce, toss until glossy and scatter with the chopped nuts.'] },

  { id: 'hd-kyllingtagine', type: 'dinner', main: 'tagine', water: 200,
    name: 'Moroccan chicken tagine with bulgur', dk: 'Marokkansk kyllingegryde med gulerødder, kikærter, rosiner & bulgur', base: 4, time: '50 min', tags: ['North African', 'Freezes well'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['gulerod', 400], ['log', 200], ['bonner', 400], ['hakkedetomater', 400], ['squash', 300], ['rosiner', 40], ['hvidlog', 10], ['ingefaer', 15], ['spidskommen', 5], ['kanel', 2], ['paprika', 5], ['citron', 100], ['persille', 20], ['olie', 20], ['bulgur', 200], ['salt', 8]],
    steps: ['Brown the chicken pieces in the oil with a little salt and take them out.', 'Fry the onion, garlic and grated ginger for 3 min, add the spidskommen, cinnamon and paprika, then the carrots in chunks, the tomatoes, drained chickpeas, raisins and 2 dl water.', 'Return the chicken, cover and simmer 25 min, adding the diced squash for the last 10 min. Season with salt.', 'Cook the bulgur in lightly salted water and finish the tagine with lemon juice and parsley.'] },

  { id: 'hd-kyllingrisotto', type: 'dinner', main: 'risotto', mixed: true, water: 1000,
    name: 'Chicken, mushroom & spinach risotto', dk: 'Risotto med kylling, champignon, squash & spinat', base: 4, time: '40 min', tags: ['Italian', 'Comfort food'],
    ing: [['kyllingebryst', 500], ['ris', 280], ['champignon', 400], ['log', 150], ['squash|broccoli|frostgront', 300], ['salat', 200], ['ost', 60], ['citron', 100], ['hvidlog', 10], ['timian', 2], ['persille', 20], ['olie', 20], ['salt', 8], ['sortpeber', 1]],
    steps: ['Fry the chicken in pieces in half the oil with salt and pepper until golden, then take it out.', 'Fry the onion, garlic and sliced mushrooms in the rest of the oil for 5 min, then stir in the rice and thyme for 1 min.', 'Add 1 l hot water a ladle at a time with the rest of the salt, stirring often, for about 18 min until creamy; add the diced squash halfway.', 'Stir in the chicken, spinach, grated cheese, lemon juice and parsley, and season with black pepper.'] },

  { id: 'hd-kyllingporre', type: 'dinner', main: 'chicken in sauce', water: 100,
    name: 'Chicken in leek & mustard sauce', dk: 'Kylling i porre-sennepssauce med champignon & kartofler', base: 4, time: '35 min', tags: ['Danish', 'Family favourite'],
    ing: [['kyllingebryst|kyllingelaar', 600], ['porre', 500], ['gulerod', 300], ['champignon', 200], ['maelk', 200], ['cremefraiche', 150], ['sennep', 30], ['persille', 20], ['kartofler', 800], ['olie', 15], ['salt', 8], ['sortpeber', 1]],
    steps: ['Boil the potatoes in salted water.', 'Brown the chicken strips in the oil, season with salt and pepper and take them out.', 'Fry the sliced leek, carrot and mushrooms for 6 min, add the milk, creme fraiche, mustard and 1 dl water and simmer 5 min.', 'Return the chicken, simmer 5 min until cooked through and scatter with parsley.'] },

  // ================= pork =================
  { id: 'hd-larb', type: 'dinner', main: 'larb & salad',
    name: 'Pork larb with rice & crisp salad', dk: 'Thailandsk larb med hakket svinekød, citron, basilikum & ris', base: 4, time: '25 min', tags: ['Thai', 'Quick'],
    ing: [['hkgris|kyllingfars', 500], ['log', 150], ['salat', 300], ['agurk', 350], ['gulerod', 200], ['kaal', 200], ['citron', 150], ['basilikum', 20], ['hvidlog', 10], ['chiliflager', 2], ['soja', 40], ['olie', 10], ['ris', 250], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water.', 'Fry the mince and garlic in the oil on high heat, breaking it up, until browned and dry, 6–8 min.', 'Take off the heat and stir in the finely sliced onion, chili flakes, lemon juice and soy sauce, then the torn basil.', 'Serve with the rice, lettuce leaves, sliced cucumber, grated carrot and shredded cabbage.'] },

  { id: 'hd-gullasch', type: 'dinner', main: 'goulash', water: 400,
    name: 'Pork goulash with peppers', dk: 'Gullasch af svinekød med paprika, peberfrugt & kartofler', base: 4, time: '1 t 15 min', tags: ['Freezes well', 'Weekend'],
    ing: [['svinestrimler', 600], ['log', 300], ['peber', 450], ['gulerod', 200], ['hakkedetomater', 400], ['tomatpure', 30], ['paprika', 15], ['spidskommen', 3], ['hvidlog', 10], ['kartofler', 800], ['skyr', 100], ['olie', 20], ['salt', 8], ['sortpeber', 1]],
    steps: ['Brown the pork in batches in the oil in a heavy pot, then add the sliced onions and cook 8 min until soft.', 'Stir in the paprika, spidskommen, garlic and tomato paste, then the tomatoes, diced carrot and 4 dl water. Cover and simmer 45 min.', 'Add the pepper strips and simmer 15 min more. Season with salt and pepper.', 'Boil the potatoes in salted water and serve with a spoon of skyr.'] },

  { id: 'hd-shogayaki', type: 'dinner', main: 'pork & cabbage', water: 50,
    name: 'Japanese ginger pork with cabbage', dk: 'Shogayaki: ingefærsvinekød med rå spidskål, broccoli & ris', base: 4, time: '25 min', tags: ['Japanese', 'Quick'],
    ing: [['svinestrimler|moerbrad', 500], ['log', 150], ['kaal', 500], ['gulerod', 200], ['broccoli|frostgront', 300], ['ingefaer', 30], ['hvidlog', 10], ['soja', 40], ['honning', 15], ['citron', 50], ['olie', 20], ['ris', 280], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water, and the broccoli for the last 4 min.', 'Stir the grated ginger and garlic with the soy sauce, honey and 3 tbsp water.', 'Fry the pork in the oil on high heat for 3 min, add the sliced onion and the sauce and cook until glossy, 2–3 min.', 'Shred the cabbage very finely, toss with the grated carrot, lemon juice and a pinch of salt, and serve raw beside the pork, broccoli and rice.'] },

  { id: 'hd-kaaldolmer', type: 'dinner', main: 'tomato sauce', sides: ['kartofler'], water: 200, pieces: [['cabbage roll', 'cabbage rolls'], 12, ['kaal', 'hkgris', 'ris', 'log', 'aeg']],
    name: 'Cabbage rolls in tomato sauce', dk: 'Kåldolmere med hakket svinekød i tomatsauce & kartofler', base: 4, time: '1 t 15 min', tags: ['Nordic', 'Cheap'],
    ing: [['hkgris|hkblanding', 500], ['kaal', 1000], ['ris', 80], ['log', 150], ['aeg', 60], ['hakkedetomater', 800], ['timian', 2], ['kartofler', 800], ['persille', 20], ['olie', 10], ['salt', 8], ['sortpeber', 1]],
    steps: ['Boil the whole cabbage in salted water for 8 min and peel off 12 soft leaves; shred the rest.', 'Mix the mince with the uncooked rice, grated onion, egg, salt and pepper. Put a spoonful on each leaf, roll up tightly and lay seam-down in an oven dish on the shredded cabbage.', 'Pour over the tomatoes mixed with 2 dl water and the thyme, drizzle with the oil and bake covered at 200°C for 50 min.', 'Boil the potatoes in salted water and serve with chopped parsley.'] },

  { id: 'hd-dandan', type: 'dinner', main: 'noodles', mixed: true, water: 150,
    name: 'Dan dan-style pork noodles', dk: 'Kinesiske nudler med sprødt svinekød, peanutsauce & grønt', base: 4, time: '25 min', tags: ['Chinese', 'Quick'],
    ing: [['hkgris', 400], ['nudler', 280], ['kaal', 400], ['broccoli|frostgront', 300], ['gulerod', 200], ['agurk', 200], ['peanutbutter', 50], ['noedder', 30], ['soja', 50], ['eddike', 20], ['honning', 10], ['chiliflager', 2], ['hvidlog', 15], ['ingefaer', 20], ['olie', 15]],
    steps: ['Cook the noodles as the pack says, adding the shredded cabbage and broccoli for the last 2 min, and drain.', 'Fry the mince in the oil on high heat until crisp, about 8 min, adding the garlic, ginger and chili flakes for the last minute.', 'Whisk the peanut butter with the soy sauce, vinegar, honey and 1.5 dl hot water to a sauce.', 'Toss the noodles and greens with the sauce and top with the mince, sliced cucumber, grated carrot and chopped nuts.'] },

  { id: 'hd-koteletter-porre', type: 'dinner', main: 'roast vegetables', roast: true, pieces: [['pork chop', 'pork chops'], 4],
    name: 'Pork chops with mustard-roast leeks', dk: 'Svinekoteletter med sennepsbagte porrer, æbler & kartofler', base: 4, time: '45 min', tags: ['Danish', 'One tray'],
    ing: [['svinestrimler', 600], ['kartofler', 800], ['porre', 500], ['gulerod', 300], ['aeble', 150], ['sennep', 30], ['honning', 10], ['timian', 2], ['skyr', 100], ['olie', 25], ['salt', 8], ['sortpeber', 1]],
    steps: ['Heat the oven to 210°C. Toss halved potatoes and carrot chunks with half the oil, the thyme and salt and roast 20 min.', 'Add the leeks in 4 cm pieces and the apple wedges, toss with most of the mustard and the honey, and roast 15 min more.', 'Season the pork chops with salt and pepper and fry them in the rest of the oil, 4–5 min per side.', 'Serve with the vegetables and the skyr stirred with the rest of the mustard.'] },

  { id: 'hd-cerdo-paprika', type: 'dinner', main: 'pork & pepper salad', roast: true,
    name: 'Spanish paprika pork with roast peppers', dk: 'Spansk paprikasvinekød med ovnkartofler & ristet peberfrugtsalat', base: 4, time: '50 min', tags: ['Spanish', 'High protein'],
    ing: [['svinestrimler|moerbrad', 600], ['kartofler', 800], ['peber', 450], ['tomat', 300], ['log', 150], ['salat', 150], ['citron', 100], ['persille', 20], ['eddike', 15], ['hvidlog', 15], ['paprika', 10], ['spidskommen', 4], ['oregano', 2], ['olie', 30], ['salt', 8]],
    steps: ['Toss the pork with the paprika, spidskommen, oregano, half the garlic, half the lemon juice, a third of the oil and some salt, and leave 15 min.', 'Heat the oven to 220°C. Roast potato chunks and the peppers in strips with another third of the oil and salt for 30–35 min.', 'Fry the pork in the rest of the oil on high heat, 5–6 min.', 'Toss the roast peppers with sliced tomatoes and onion, the rest of the garlic and lemon, the vinegar and parsley, and serve with the pork, potatoes and lettuce.'] },

  { id: 'hd-moerbrad-salsa', type: 'dinner', main: 'pork, sweet potatoes & salsa',
    name: 'Cumin pork tenderloin with corn salsa', dk: 'Spidskommen-mørbrad med søde kartofler, majssalsa & skyr', base: 4, time: '45 min', tags: ['Mexican', 'Lean'],
    ing: [['moerbrad', 600], ['sodkartoffel', 800], ['majs', 300], ['tomat', 300], ['peber', 150], ['log', 100], ['salat', 200], ['skyr', 150], ['citron', 100], ['spidskommen', 5], ['paprika', 5], ['chiliflager', 1], ['olie', 25], ['salt', 8], ['sortpeber', 1]],
    steps: ['Heat the oven to 210°C. Toss sweet potato wedges with half the oil, half the spidskommen and salt and roast 30 min.', 'Rub the tenderloin with the rest of the spidskommen, the paprika, salt and pepper, brown it in the rest of the oil, and roast it on the tray for the last 15–18 min to 65°C in the middle.', 'Dice the tomatoes, pepper and onion and mix with the drained corn, lemon juice, chili flakes and a pinch of salt.', 'Slice the pork and serve with the sweet potatoes, salsa, lettuce and skyr.'] },

  // ================= beef =================
  { id: 'hd-bulgogi', type: 'dinner', main: 'beef & vegetables',
    name: 'Korean-style beef bowl with quick pickles', dk: 'Koreansk skål med hakket oksekød, ris & hurtigsyltet grønt', base: 4, time: '25 min', tags: ['Korean', 'Quick'],
    ing: [['hkokse|hkblanding', 500], ['kaal', 400], ['gulerod', 300], ['agurk', 350], ['salat', 100], ['eddike', 30], ['soja', 40], ['honning', 15], ['hvidlog', 15], ['ingefaer', 20], ['chiliflager', 1], ['olie', 10], ['ris', 250], ['salt', 2]],
    steps: ['Boil the rice in lightly salted water.', 'Toss the shredded cabbage, carrot strips and sliced cucumber with the vinegar and a pinch of salt and leave to pickle.', 'Fry the mince in the oil on high heat until browned and crisp, 6–8 min.', 'Stir in the grated garlic and ginger, chili flakes, soy sauce and honey and cook 2 min until sticky. Build bowls of rice, beef, lettuce and pickled vegetables.'] },

  { id: 'hd-kofta', type: 'dinner', main: 'tomato sauce', pieces: [['kofta', 'koftas'], 12, ['hkokse', 'log', 'persille', 'spidskommen', 'kanel', 'hvidlog']],
    name: 'Beef kofta in spiced tomato sauce', dk: 'Krydrede oksekofta i tomatsauce med spinat, bulgur & yoghurt', base: 4, time: '40 min', tags: ['Middle Eastern', 'Freezes well'],
    ing: [['hkokse|hkblanding|hkgris', 500], ['log', 200], ['hakkedetomater', 800], ['peber|squash', 300], ['salat', 200], ['persille', 40], ['yoghurt|skyr', 150], ['hvidlog', 10], ['spidskommen', 5], ['kanel', 1], ['paprika', 5], ['olie', 15], ['bulgur', 200], ['salt', 8], ['sortpeber', 1]],
    steps: ['Mix the mince with half the grated onion, half the parsley, the spidskommen, cinnamon, half the garlic, salt and pepper, and shape 12 oval koftas.', 'Brown them in the oil for 5 min and take them out.', 'Fry the rest of the onion and garlic and the diced pepper for 4 min, add the paprika and tomatoes, return the koftas and simmer 15 min. Stir in the spinach at the end.', 'Cook the bulgur in lightly salted water and serve with the yoghurt and the rest of the parsley.'] },

  { id: 'hd-moussaka', type: 'dinner', main: 'moussaka', mixed: true,
    name: 'Lighter moussaka with potato & squash', dk: 'Moussaka med oksekød, kartofler, squash & yoghurt-æggetop', base: 4, time: '1 t 15 min', tags: ['Greek', 'Weekend'],
    ing: [['hkokse|hkblanding', 400], ['kartofler', 600], ['squash', 500], ['log', 150], ['hakkedetomater', 400], ['tomatpure', 30], ['yoghurt', 300], ['aeg', 120], ['ost', 40], ['hvidlog', 10], ['kanel', 2], ['oregano', 2], ['olie', 20], ['salt', 8], ['sortpeber', 1]],
    steps: ['Heat the oven to 200°C. Slice the potatoes and squash thinly, toss with half the oil and some salt and bake on trays for 15 min.', 'Brown the mince with the onion and garlic in the rest of the oil, add the tomato paste, cinnamon, oregano, tomatoes, salt and pepper and simmer 10 min.', 'Layer potatoes, meat sauce and squash in a dish, ending with vegetables.', 'Whisk the yoghurt with the eggs and grated cheese, spread it on top and bake 30 min until golden.'] },

  { id: 'hd-picadillo', type: 'dinner', main: 'picadillo', sides: ['ris'], water: 200,
    name: 'Mexican picadillo with rice', dk: 'Picadillo: hakket oksekød med kartofler, gulerødder, rosiner & ris', base: 4, time: '40 min', tags: ['Mexican', 'Family favourite'],
    ing: [['hkokse|hkblanding|hkgris', 400], ['kartofler', 400], ['gulerod', 300], ['peber', 300], ['log', 150], ['hakkedetomater', 400], ['kaal|salat', 200], ['rosiner', 30], ['hvidlog', 10], ['spidskommen', 4], ['kanel', 1], ['oregano', 2], ['chiliflager', 1], ['olie', 15], ['ris', 200], ['salt', 8]],
    steps: ['Brown the mince with the onion and garlic in the oil.', 'Add the spidskommen, cinnamon, oregano and chili flakes, then the diced potatoes, carrots and pepper, the tomatoes, raisins and 2 dl water. Cover and simmer 20 min until the potatoes are tender, and season with salt.', 'Boil the rice in lightly salted water.', 'Shred the cabbage finely, toss with a pinch of salt and serve alongside.'] },

  { id: 'hd-palakgosht', type: 'dinner', main: 'curry', water: 500,
    name: 'Beef & spinach curry', dk: 'Indisk oksekarry med spinat, tomat, yoghurt & ris', base: 4, time: '1 t 45 min', tags: ['Indian', 'Weekend', 'Freezes well'],
    ing: [['oksetern', 600], ['salat', 400], ['log', 300], ['hakkedetomater', 400], ['yoghurt', 200], ['hvidlog', 15], ['ingefaer', 25], ['karry', 12], ['spidskommen', 4], ['kanel', 1], ['chiliflager', 1], ['olie', 20], ['ris', 250], ['salt', 8]],
    steps: ['Brown the beef in batches in the oil in a heavy pot and take it out.', 'Fry the sliced onions for 8 min until golden, then add the garlic, grated ginger, karry, spidskommen, cinnamon and chili flakes for 1 min.', 'Return the beef with the tomatoes and 5 dl water, cover and simmer 1¼ hours until tender.', 'Stir in the spinach until wilted, take off the heat, stir in the yoghurt and season with salt. Boil the rice in lightly salted water and serve.'] },

  { id: 'hd-pho', type: 'dinner', main: 'noodle soup', sides: [], soup: true, water: 2000, leftovers: false, pieces: [['meatball', 'meatballs'], 24],
    name: 'Pho-style beef meatball noodle soup', dk: 'Vietnamesisk nudelsuppe med oksekødboller, ingefær, kanel & grønt', base: 4, time: '45 min', tags: ['Vietnamese', 'Light'],
    ing: [['hkokse|hkblanding', 400], ['nudler', 250], ['log', 300], ['kaal', 300], ['gulerod', 200], ['champignon', 200], ['salat', 100], ['ingefaer', 40], ['hvidlog', 10], ['kanel', 2], ['soja', 40], ['basilikum', 20], ['citron', 100], ['chiliflager', 1], ['salt', 3]],
    steps: ['Halve the onions and char them cut-side down in a dry pot for 5 min, then add the sliced ginger, garlic, cinnamon, soy sauce, salt and 2 l water and simmer 20 min.', 'Roll the mince into 24 small balls with wet hands.', 'Lift out the onion and ginger, add the meatballs, sliced mushrooms and carrot strips and simmer 8 min.', 'Cook the noodles as the pack says and divide them into bowls with the shredded cabbage and lettuce.', 'Ladle over the hot soup and top with basil, lemon juice and chili flakes.'] },
];

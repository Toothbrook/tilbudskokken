// 14 healthy breakfasts: warm and cold, sweet and savoury, quick weekday and slower weekend, some make-ahead.
export default [
  { id: 'hb-bakedoats', type: 'breakfast', main: 'baked oats', name: 'Apple-cinnamon baked oats', dk: 'Bagt havregrød med æble, kanel & nødder (til 4 morgener)', base: 4, time: '40 min', tags: ['Make ahead', 'Warm'],
    ing: [['havregryn', 240], ['maelk', 500], ['aeg', 240], ['aeble|banan|baer', 400], ['noedder', 40], ['kanel', 4], ['bagepulver', 6], ['salt', 1]],
    steps: ['Heat the oven to 180°C. Whisk the eggs with the milk, cinnamon, baking powder and salt.', 'Stir in the oats and half the chopped fruit, and pour into an oven dish.', 'Scatter over the rest of the fruit and the chopped nuts, and bake 30 min until set.', 'Cut into 4 pieces. They keep 4 days in the fridge; eat cold or warmed.'] },

  { id: 'hb-ollebrod', type: 'breakfast', name: 'Rye bread porridge (øllebrød-style)', dk: 'Rugbrødsgrød med mælk, kanel & skyr', base: 1, time: '15 min', tags: ['Danish classic', 'Warm'],
    ing: [['rugbrod', 90], ['maelk', 250], ['skyr|kvark', 100], ['kanel', 1], ['citron', 10]],
    steps: ['Break the rye bread into a small pot with 1 dl water and leave 10 min (or overnight) to soften.', 'Add the milk and cinnamon and simmer 5 min, stirring and mashing, until smooth.', 'Grate in a little lemon zest and serve topped with the cold skyr.'] },

  { id: 'hb-spinatomelet', type: 'breakfast', name: 'Spinach & feta omelette', dk: 'Omelet med spinat, feta & tomat på rugbrød', base: 1, time: '10 min', tags: ['High protein', 'Savoury'],
    ing: [['aeg', 120], ['salat', 60], ['feta', 30], ['tomat', 100], ['rugbrod', 45], ['olie', 5], ['sortpeber', 0.3]],
    steps: ['Wilt the spinach in the oil in a frying pan.', 'Pour over the beaten eggs, crumble in the feta and cook on low heat until just set. Season with black pepper.', 'Serve with the sliced tomato and a slice of rye.'] },

  { id: 'hb-kvarkaeble', type: 'breakfast', name: 'Kvark with warm cinnamon apples', dk: 'Kvark med stegte kanelæbler, havregryn & nødder', base: 1, time: '10 min', tags: ['High protein', 'Warm'],
    ing: [['kvark|skyr', 200], ['aeble', 150], ['smor', 5], ['kanel', 1], ['havregryn', 30], ['noedder', 15]],
    steps: ['Fry the diced apple in the butter with the cinnamon, 4–5 min until soft.', 'Toast the oats and chopped nuts in the same pan for 1 min.', 'Spoon over the cold kvark.'] },

  { id: 'hb-aeblegrod', type: 'breakfast', name: 'Apple-cinnamon porridge with nuts', dk: 'Havregrød med revet æble, kanel & nødder', base: 1, time: '10 min', tags: ['Warm', 'No added sugar'],
    ing: [['havregryn', 50], ['maelk', 250], ['aeble', 150], ['noedder', 15], ['kanel', 1], ['salt', 0.5]],
    steps: ['Simmer the oats in the milk with the grated apple, cinnamon and a pinch of salt for 5 min, stirring.', 'Top with the chopped nuts.'] },

  { id: 'hb-hytteostbowl', type: 'breakfast', name: 'Savoury cottage cheese bowl', dk: 'Hytteost med agurk, tomat, krydderurter & rugbrød', base: 1, time: '5 min', tags: ['High protein', 'Savoury'],
    ing: [['hytteost', 200], ['tomat|peber', 100], ['agurk', 100], ['purloeg|dild|persille', 5], ['olie', 5], ['sortpeber', 0.3], ['rugbrod', 45]],
    steps: ['Spoon the cottage cheese into a bowl and top with diced tomato and cucumber.', 'Scatter over the chopped herbs, drizzle with the oil and season with black pepper.', 'Eat with a slice of rye.'] },

  { id: 'hb-havreboller', type: 'breakfast', main: 'rolls', pieces: [['roll', 'rolls'], 12, ['mel', 'havregryn', 'gaer', 'olie', 'salt']], name: 'Oat rolls with cottage cheese', dk: 'Hjemmebagte havreboller med hytteost & tomat (frys resten)', base: 6, time: '1 t 30 min', tags: ['Weekend', 'Freezes well'],
    ing: [['mel', 400], ['havregryn', 150], ['gaer', 25], ['olie', 15], ['salt', 8], ['hytteost|kvark', 480], ['tomat|agurk|peber', 600]],
    steps: ['Dissolve the yeast in 4 dl lukewarm water, then knead in the oats, oil, salt and flour to a soft dough.', 'Let it rise 45 min, shape into 12 rolls on a baking tray and rise 20 min more.', 'Bake at 220°C for 15 min. Freeze what you will not eat in 2 days.', 'Serve 2 rolls per person with cottage cheese and sliced tomato.'] },

  { id: 'hb-nordisk', type: 'breakfast', name: 'Nordic breakfast plate', dk: 'Morgenanretning: rugbrød, kogt æg, ost, skyr med bær & agurk', base: 1, time: '12 min', tags: ['Weekend', 'High protein'],
    ing: [['aeg', 60], ['rugbrod', 45], ['ost', 20], ['skyr|yoghurt|kvark', 100], ['baer|citrus|aeble', 80], ['agurk|tomat|peber', 80], ['salt', 0.3]],
    steps: ['Boil the egg 8 min, cool it in cold water and halve it with a pinch of salt.', 'Lay out the rye bread, cheese and sliced cucumber on a plate.', 'Serve the skyr in a small bowl with the fruit.'] },

  { id: 'hb-groensmoothie', type: 'breakfast', name: 'Spinach, banana & ginger smoothie', dk: 'Grøn smoothie med spinat, banan, ingefær & skyr', base: 1, time: '5 min', tags: ['Quick'],
    ing: [['salat', 50], ['banan', 120], ['skyr|kvark|yoghurt', 150], ['havregryn', 30], ['maelk', 150], ['ingefaer', 5]],
    steps: ['Blend the spinach, banana, skyr, oats, milk and grated ginger until smooth.', 'Add a splash of water if it is too thick.'] },

  { id: 'hb-peanutshake', type: 'breakfast', name: 'Banana, peanut & oat shake', dk: 'Shake med banan, peanutbutter, havregryn & skyr', base: 1, time: '5 min', tags: ['Quick', 'High protein'],
    ing: [['banan', 120], ['peanutbutter', 15], ['maelk', 250], ['havregryn', 30], ['skyr|kvark', 100], ['kanel', 0.5]],
    steps: ['Blend everything with a pinch of cinnamon until smooth.', 'Pour into a glass or a bottle to take with you.'] },

  { id: 'hb-bulgurbowl', type: 'breakfast', name: 'Bulgur breakfast bowl with egg', dk: 'Bulgur med æg, tomat, agurk, persille & feta', base: 1, time: '15 min', tags: ['Savoury', 'Weekend'],
    ing: [['bulgur', 50], ['aeg', 60], ['tomat', 80], ['agurk', 80], ['persille', 5], ['citron', 10], ['olie', 5], ['feta', 20], ['salt', 0.5]],
    steps: ['Pour 1 dl boiling water over the bulgur with the salt, cover and leave 10 min.', 'Meanwhile boil the egg 7 min and cool it in cold water.', 'Fluff the bulgur with the lemon juice, oil and chopped parsley.', 'Top with diced tomato and cucumber, crumbled feta and the halved egg.'] },

  { id: 'hb-kvarkpandekager', type: 'breakfast', name: 'Kvark-oat pancakes with berries', dk: 'Proteinpandekager med kvark, havregryn & bær', base: 1, time: '20 min', tags: ['Weekend', 'High protein'],
    ing: [['kvark|skyr', 100], ['aeg', 120], ['havregryn', 40], ['bagepulver', 2], ['olie', 5], ['baer|banan|aeble', 100], ['salt', 0.3]],
    steps: ['Blend the kvark, eggs, oats, baking powder and a pinch of salt to a thick batter and rest 5 min.', 'Fry small pancakes in the oil over medium heat, 2 min per side.', 'Serve topped with the berries.'] },

  { id: 'hb-champignonrug', type: 'breakfast', name: 'Mushrooms & poached egg on rye', dk: 'Rugbrød med stegte champignoner, spinat & pocheret æg', base: 1, time: '15 min', tags: ['Savoury', 'Warm'],
    ing: [['champignon', 150], ['salat', 40], ['aeg', 60], ['rugbrod', 90], ['smor', 5], ['hvidlog', 5], ['timian', 0.5], ['salt', 0.5]],
    steps: ['Fry the sliced mushrooms in the butter with the garlic, thyme and salt for 5 min, then wilt in the spinach.', 'Poach the egg 3 min in barely simmering water.', 'Pile the mushrooms on the rye and top with the egg.'] },

  { id: 'hb-boennerrug', type: 'breakfast', main: 'beans', name: 'Homemade tomato beans with egg on rye', dk: 'Hjemmelavede bønner i tomat med spejlæg & rugbrød (til 4 morgener)', base: 4, time: '25 min', tags: ['Make ahead', 'Savoury'],
    ing: [['bonner', 480], ['hakkedetomater', 400], ['log', 150], ['tomatpure', 30], ['paprika', 3], ['olie', 10], ['salt', 4], ['aeg', 240], ['rugbrod', 180]],
    steps: ['Soften the chopped onion in half the oil, then add the paprika and tomato paste.', 'Add the drained beans, tomatoes and salt and simmer 15 min until thick. Keeps 4 days in the fridge.', 'Each morning, fry an egg in a little of the remaining oil and serve it on a slice of rye with a quarter of the warmed beans.'] },
];

/* The Abbey Grange. Retold from Arthur Conan Doyle's 1904 story (public domain). Spoilers inside. */
(() => {
  const { N, S, Y, show, hide, clue, sfx, slate, flag, flash, shake, opt } = KIT;

  const CLUES = {
    rope: { icon: '🔔', name: 'The bell-rope', type: 'Evidence', text: `The bell-rope that tied Lady Brackenstall hangs from a high ceiling. It was cut, not torn, and the end has been frayed by hand to look as if it had broken. It is far too high for a woman standing on a chair to pull.` },
    glasses: { icon: '🍷', name: 'Three wine glasses', type: 'Evidence', text: `Three glasses on the sideboard, but the dregs lie in only two. The third has been filled, and left. Someone wanted three drinkers to be imagined.` },
    poker: { icon: '🔥', name: 'The bent poker', type: 'Evidence', text: `The fireplace poker lies on the carpet with a dark smear and a slight bend. A strong, practised blow, struck from the front by a man who knew what he was doing.` },
    silver: { icon: '🥄', name: 'Silver in the pond', type: 'Evidence', text: `Hopkins finds the "stolen" silver plate in the Abbey pond, not far from the house. A gang of burglars does not hide its loot in a pond at the end of the garden.` },
    welts: { icon: '🩹', name: `Welts on the Lady's arm`, type: 'Evidence', text: `A fresh bruise below Lady Brackenstall's sleeve, and the faint pale line of older scars. She says burglars struck her. The scars are years old.` },
    window: { icon: '🪟', name: 'The unlocked window', type: 'Evidence', text: `The dining-room window was opened from the inside. The frost on the sill is unbroken, and nobody climbed in.` },
    wigs: { icon: '🧶', name: 'Wax drips on the wall', type: 'Evidence', text: `A line of wax drips on the mantel and nothing burnt: someone lit candles in the dark and put them out before the alarm.` },
    ladyStory: { icon: '🗣️', name: `The Lady's story`, type: 'Testimony', text: `Lady Brackenstall says three men burst in, struck her husband, tied her to a chair with the bell-rope, and ransacked the room. She remembers little else.` },
    theresaStory: { icon: '💬', name: `Theresa's story`, type: 'Testimony', text: `Theresa Wright, the maid, found her mistress tied and her master dead. She says the master was cruel and drunk, and that she never saw the men.` },
    randalls: { icon: '🕵️', name: 'The Randall gang', type: 'Testimony', text: `Hopkins is certain the three thieves are the Randalls, an old father and two sons, who stole silver in Sydenham last month the same way.` },
    randallAlibi: { icon: '📟', name: `The Randalls were in a cell`, type: 'Testimony', text: `A telegram from the north: the Randalls were arrested in Cheshire for another job two days before the murder, and have been locked up since.` },
    sirEustace: { icon: '🍺', name: 'Sir Eustace', type: 'Testimony', text: `The servants: the baronet was a brute when drunk. He once poured spirits over his wife's pet dog and set it alight, and he was famous for his temper.` },
    shipping: { icon: '⚓', name: 'The ship from Adelaide', type: 'Testimony', text: `Lady Brackenstall was Mary Fraser of Adelaide. She sailed to England on the Rock of Gibraltar, whose captain is a man called Croker. The ship docked in Southampton four days before the murder.` },
    crokerLetter: { icon: '✉️', name: `A letter signed "J. C."`, type: 'Testimony', text: `A letter from the Lady's writing desk, signed only "J. C.", inviting her to walk in the garden on the night of the murder. It was never sent. It was kept.` }
  };

  const ep1 = {
    n: 1, title: 'The Staged Scene', logline: `A brutal baronet dead in his dining room. A wife tied to a chair. A burglary that doesn't add up.`,
    recap: [],
    scenes: [
      {
        id: 'train', bg: 'train', amb: 'room', mood: 'calm', fx: 'dust',
        steps: [
          slate('A morning train to Chislehurst · January'),
          show('watson', 'l', 'n'),
          S('watson', `Inspector Hopkins has wired. Sir Eustace Brackenstall, murdered at the Abbey Grange. Three burglars, he thinks. The lady of the house was tied to a chair.`),
          Y(`Hopkins is one of the few men at Scotland Yard I would trust to see a footprint, Watson. He sees what's there. He sometimes cannot see what is not.`),
          S('watson', `And what is not there, in this case?`),
          { choice: { prompt: 'What do you say to Watson?', opts: [
            { t: `"I do not know yet. I only know that burglars rarely tie a lady with a bell-rope."`, steps: [flag('rope'), S('watson', `An odd choice of cord.`)] },
            { t: `"It sounds a great deal too orderly. Real violence is clumsy."`, steps: [flag('orderly'), S('watson', `You do like a mess, Holmes.`)] }
          ] } },
          N(`The train slows. Beyond the window a long avenue of bare trees leads up to a grey house, silent in the winter light.`),
          sfx('door')
        ]
      },
      {
        id: 'dining', bg: 'dining', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Abbey Grange · dining room · eleven o\'clock'),
          show('hopkins', 'l', 'w'),
          S('hopkins', `Mr. Holmes! Thank heavens. Sir Eustace was found here by his wife's maid, killed with the poker. The lady says three men did it, a big man and two helpers.`),
          S('hopkins', `I'm sure they are the Randalls, from Sydenham. It's their way of working to the letter.`),
          Y(`I shall be glad to be convinced, Hopkins. May I have the room to myself?`),
          hide('hopkins'),
          { menu: { prompt: 'Examine the dining room', style: 'scene', must: 'Look at the bell-rope, the glasses and the poker.', done: `I've seen what the room will say.`, items: [
            { id: 'rope', icon: '🔔', label: 'The bell-rope', must: true, steps: [
              N(`The thick bell-rope hangs from the high ceiling, snapped, with the end gnawed. A chair stands beneath it.`),
              Y(`The lady says she pulled the rope in despair, and it broke in her hand. But look.`),
              N(`You climb the chair. The rope hangs a good foot above where even a tall man could comfortably reach.`),
              Y(`And look at the end. A cut, which someone has frayed with a knife to make it look as if it had broken. This was a staged scene.`),
              clue('rope')
            ] },
            { id: 'glasses', icon: '🍷', label: 'The glasses', must: true, steps: [
              N(`Three wine glasses stand on the sideboard, beside an opened bottle.`),
              Y(`Hopkins, how many men did the lady say drank here?`),
              S('hopkins', `Three, sir. All three drank before the murder.`, 'w'),
              Y(`Three glasses. But look at the dregs. The crust of the wine has settled in only two of them.`),
              Y(`The third was filled, and set down, and never drunk. Someone wanted to make a count of three.`),
              clue('glasses')
            ] },
            { id: 'poker', icon: '🔥', label: 'The poker', must: true, steps: [
              N(`The poker lies on the hearth rug, bent a little at the tip, with a stain on the end.`),
              Y(`A strong blow. And from the front, Hopkins, not from behind. Sir Eustace was facing his killer.`),
              clue('poker')
            ] },
            { id: 'window', icon: '🪟', label: 'The window', steps: [
              N(`The window by the garden door has been left unlatched. Frost lies undisturbed on the sill.`),
              Y(`Nobody climbed in through this window, Hopkins. It was unlatched from the inside.`),
              clue('window')
            ] },
            { id: 'mantel', icon: '🕯️', label: 'The mantel', steps: [
              N(`A line of wax drips has run down the mantelpiece, and the candles have been snuffed.`),
              Y(`Someone lit candles, and put them out again before the alarm was raised.`),
              clue('wigs')
            ] }
          ] } },
          show('hopkins', 'c', 'w'),
          S('hopkins', `You do like to make it difficult, Mr. Holmes. It's the Randalls. I'd stake my promotion on it.`),
          Y(`Then I hope you've not staked anything you cannot afford to lose.`)
        ]
      },
      {
        id: 'lady', bg: 'drawing', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The drawing room · noon'),
          show('lady', 'c', 'sh'),
          S('lady', `Mr. Holmes, you must forgive me. I am still not myself. My husband is dead.`, 'sh'),
          { menu: { prompt: 'Question Lady Brackenstall', style: 'talk', must: 'Ask what she remembers of the night.', done: `Thank you, Lady Brackenstall.`, items: [
            { id: 'l_night', label: `"What do you remember?"`, must: true, steps: [
              S('lady', `Three men came in through the dining-room window. A tall man, and two others. They knocked me down and tied me to the chair with the bell-rope.`),
              S('lady', `My husband came in. They struck him. That is all.`, 'sh'),
              clue('ladyStory')
            ] },
            { id: 'l_arm', label: `"May I see your arm?"`, steps: [
              S('lady', `It's nothing. The men caught me when I fell.`, 'w'),
              N(`The sleeve slips. A fresh bruise, and underneath it a long pale scar, years old.`),
              Y(`Those scars are not from last night.`),
              S('lady', `Please. Sir Eustace was not an easy man to live with.`, 'sh'),
              clue('welts')
            ] },
            { id: 'l_desk', icon: '✉️', label: `"May I look at your writing desk?"`, steps: [
              S('lady', `If you must. There is nothing in it.`, 'w'),
              N(`Under the blotter lies a folded note, signed only with two initials.`),
              Y(`"J. C." Who is J. C.?`),
              S('lady', `An old friend. It's nothing, Mr. Holmes.`, 'sh'),
              clue('crokerLetter')
            ] },
            { id: 'l_ship', label: `"Where are you from, Lady Brackenstall?"`, steps: [
              S('lady', `Adelaide, in Australia. My maiden name was Mary Fraser. I came to England on the Rock of Gibraltar and married Sir Eustace within the year.`),
              clue('shipping')
            ] }
          ] } },
          hide('lady')
        ]
      },
      {
        id: 'theresa', bg: 'kitchen', amb: 'room', mood: 'tense', fx: 'dust',
        steps: [
          slate('The kitchen · afternoon'),
          show('theresa', 'c', 'a'),
          S('theresa', `I found her tied to that chair, sir. And him on the floor. I won't weep for him, and I'd be lying if I said I would.`),
          { menu: { prompt: 'Question Theresa Wright', style: 'talk', must: 'Ask what kind of man Sir Eustace was.', done: `That will do.`, items: [
            { id: 't_eustace', label: `"What was Sir Eustace like?"`, must: true, steps: [
              S('theresa', `A brute, sir. Drunk most nights. He once poured spirits over my lady's little dog and set a match to it, and laughed.`, 'a'),
              clue('sirEustace')
            ] },
            { id: 't_night', label: `"What did you see that night?"`, must: true, steps: [
              S('theresa', `I was asleep in the attic, sir. I came down at the noise and found them as you saw. I never saw the men.`),
              clue('theresaStory')
            ] },
            { id: 't_lady', label: `"Your mistress seems frightened."`, steps: [
              S('theresa', `She has had a hard year, sir. A hard marriage. She doesn't deserve more.`, 'w')
            ] }
          ] } },
          hide('theresa')
        ]
      },
      {
        id: 'pond', bg: 'garden', amb: 'wind', mood: 'dread', fx: 'dust',
        steps: [
          slate('The garden · dusk'),
          show('hopkins', 'l', 'w'),
          S('hopkins', `The silver plate is missing, Mr. Holmes. The burglars took it all. It's probably in a Sydenham pawnshop by now.`),
          Y(`May I ask you to have the pond dragged, Inspector?`),
          S('hopkins', `The pond? Whatever for?`, 'w'),
          Y(`Humour me.`),
          N(`Two constables with a long hook wade into the dark water. After a quarter of an hour one of them gives a shout.`),
          sfx('hit'),
          N(`Out comes a sodden bundle: the missing silver plate, wrapped in a tablecloth.`),
          clue('silver'),
          S('hopkins', `Good Lord. The burglars hid their plunder... in the pond?`, 'sh'),
          Y(`Burglars do not hide their loot in a pond at the bottom of the garden, Hopkins. Someone wanted you to find it was a burglary.`),
          N(`In the dark windows of the Abbey Grange, a single candle moves from room to room.`),
          { cliff: 'lady' }
        ]
      }
    ],
    vote: { key: 'r1', title: 'Episode 1 verdict', qs: [
      { id: 'eustace', text: `Who killed Sir Eustace Brackenstall?`, options: [opt('lady'), opt('theresa'), { id: 'randalls', label: 'The Randall gang' }, { id: 'unknown', label: 'Someone we have not met yet' }] }
    ] },
    watch: {
      lady: `Tied up. Scarred. Her story has three men in it and none of them leave marks.`,
      theresa: `Fierce, loyal, and not sorry that her master is dead.`,
      hopkins: `Certain of the Randall gang. Looking more uncertain by the hour.`
    },
    teaser: `Next: a ship called the Rock of Gibraltar, and a man who loved a woman more than he feared the gallows.`
  };

  const ep2 = {
    n: 2, last: true, title: 'Counting the Glasses', logline: `Three glasses, one rope, and a question that is not only who, but what must be done.`,
    recap: [`A bell-rope that could never have been pulled.`, `Three glasses, only two of them drunk from.`, `Silver hidden in a pond.`, `And a lady with old scars.`],
    scenes: [
      {
        id: 'inn', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Abbey Grange · the next morning'),
          show('watson', 'l', 'n'), show('hopkins', 'r', 'w'),
          S('hopkins', `Mr. Holmes, a telegram from the north. The Randalls were in a Cheshire cell the night of the murder.`, 'sh'),
          clue('randallAlibi'),
          Y(`Then the Randalls are innocent, Hopkins, and your theory is a ruin. I'm sorry.`),
          S('hopkins', `Then who? Not the Lady. Not the maid.`),
          { present: { prompt: 'Why was the scene staged?', ok: ['rope', 'glasses', 'silver', 'window', 'welts'], cost: 1, hint: `Why would anyone invent three burglars?`,
            right: [
              Y(`Look at what was done. A bell-rope cut and frayed by hand. A third glass filled to make a count of three. Silver sunk in a pond.`),
              Y(`Somebody went to a great deal of trouble to imagine three burglars. People don't invent burglars unless the truth is a person they love.`),
              S('watson', `Then the lady and her maid are protecting someone.`),
              Y(`Quite so. Two glasses. Two men drank in that room, and one of them was not Sir Eustace's guest.`, 'a')
            ],
            wrong: () => [S('hopkins', `But the burglars were there, Mr. Holmes!`)] } },
          { present: { prompt: 'Who is the mysterious third person?', ok: ['shipping', 'crokerLetter', 'sirEustace'], cost: 1, hint: `A voyage from Adelaide. A captain. A man who might have loved her.`,
            right: [
              Y(`Lady Brackenstall was Mary Fraser of Adelaide. She came to England on the Rock of Gibraltar, whose captain was Jack Croker.`),
              Y(`The ship docked in Southampton four days before the murder. The Captain is a man of the sea, strong, loyal, and used to rope.`),
              S('watson', `The man who tied the lady was a sailor. Of course. No landsman would tie that knot.`),
              Y(`A sailor's knot, Watson. On a bell-rope. Hopkins, I should like to call on Captain Croker.`)
            ],
            wrong: () => [S('watson', `A third person? Who?`)] } },
          hide('watson'), hide('hopkins')
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'clock', mood: 'finale', fx: 'dust',
        steps: [
          slate('The Abbey Grange · the drawing room · night'),
          N(`Hopkins, Watson, the lady, the maid, and a broad, sunburnt man in a captain's coat who has come in out of the rain with his cap in his hand.`),
          show('hopkins', 'l', 'w'), show('lady', 'cl', 'sh'), show('theresa', 'cr', 'a'), show('croker', 'r', 'n'),
          Y(`Inspector Hopkins, here is your murderer. He is in this room.`),
          { accuse: { qid: 'eustace', vote: { key: 'f_eustace', title: 'The Reckoning: Sir Eustace', qs: [{ id: 'eustace', text: `Who killed Sir Eustace Brackenstall?` }], options: [opt('lady'), opt('theresa'), opt('croker'), { id: 'randalls', label: 'The Randall gang' }] },
            wrong: {
              lady: [S('lady', `I wish I had the courage, Mr. Holmes. It was not I.`, 'sh'), Y(`The poker's blow was far too strong for a woman's hand. No.`)],
              theresa: [S('theresa', `If I could have done it I'd have done it years ago, sir. But I didn't.`, 'a'), Y(`The blow came from the front, struck by a man. Think again.`)],
              randalls: [S('hopkins', `But the telegram, Mr. Holmes! The Randalls are in a cell!`, 'sh'), Y(`Quite so. They never saw this house.`)]
            },
            right: [
              hide('hopkins'), hide('lady'), hide('theresa'), show('croker', 'c', 'n'),
              Y(`Captain Croker. You came to this house, unseen, in the dark.`),
              S('croker', `I did, sir.`),
              { present: { prompt: 'What happened in the dining room?', ok: ['poker', 'welts', 'sirEustace', 'crokerLetter'], cost: 1, hint: `A man with a temper. A lady with old scars. A poker.`,
                right: [
                  Y(`You came to meet Mary Fraser in the garden. And you came on the one night Sir Eustace was drunk, and cruel, and she was in the dining room.`),
                  Y(`He had raised a whip or a bottle. Perhaps both. And you struck, Captain, in the heat of it, and the poker came down.`),
                  N(`The old sailor stands very still. His broad hands, brown and scarred, hang open at his sides.`),
                  S('croker', `He struck her, Mr. Holmes. He struck her across the face with the dog-whip. I saw it from the window. I would do it again.`, 'a'),
                  S('croker', `I did not mean to kill him. It was one blow, and he fell, and we stood there, her and me, and Theresa came in.`),
                  S('theresa', `We tied the lady up, sir. We made the burglars. It was my idea, not hers, and I'd do it again.`, 'a'),
                  S('lady', `Mr. Holmes. Do what you must.`, 'sh')
                ],
                wrong: () => [S('croker', `I'll answer for what I've done, sir, but you've more to prove.`)] } },
              hide('croker')
            ] } },
          show('hopkins', 'l', 'w'), show('lady', 'c', 'sh'), show('croker', 'r', 'n'),
          N(`Hopkins stands with his hat in his hand, staring at the sailor. Nobody speaks.`),
          S('hopkins', `Mr. Holmes. I am an officer of the law. What would you have me do?`),
          Y(`I'm no judge, Hopkins. This room is the jury. You've heard it all. You've seen the scars on the lady's arm and the bruise on the baronet's conscience.`),
          { choice: { prompt: 'The jury must decide. What should be done with Captain Croker?', opts: [
            { t: `"Mercy. He defended a woman from a brute. Let him go, and let the Randalls take the blame."`, steps: [
              flag('mercy'),
              Y(`Then I'll not call it murder. Say it was done in her defence, Hopkins, and blame the Randalls in your report.`),
              S('hopkins', `God forgive me. I'll write that the gang did it, and that they escaped.`, 'sh'),
              S('croker', `I'll sail on the next tide, sir. I'll not trouble England again.`),
              N(`Dawn comes grey over the Abbey Grange. By noon, a ship is slipping out of Southampton, and a lady stands at the window of an empty house, watching a distant sail.`)
            ] },
            { t: `"Justice. The law must decide. Let a jury weigh what he did."`, steps: [
              flag('justice'),
              Y(`Then let a jury decide, Hopkins. Tell them everything: the dog-whip, the scars, and the one blow.`),
              S('croker', `I'll answer to any court, sir. I have no shame in it.`),
              S('hopkins', `I'll see the truth is told, Mr. Holmes. Every word of it.`),
              N(`The trial lasts two days. The jury is out for twenty minutes. It returns the verdict that every newspaper in England will later call just: not guilty.`)
            ] }
          ] } },
          N(`Back in Baker Street, Watson asks if you did the right thing.`),
          show('watson', 'cl', 'n'),
          S('watson', `Did we do right, Holmes?`),
          Y(`I am not sure, Watson. But the scars on that lady's arm were real. The law is a blunt instrument, and sometimes it needs a human hand to guide it.`),
          { cliff: 'holmes' }
        ]
      }
    ],
    watch: {
      lady: `Free of her husband at last. Free of the truth? That is another matter.`,
      theresa: `Loyal to the end. Invented three burglars out of sheer love.`,
      croker: `Sailed into the dark with a sailor's sense of honour.`,
      hopkins: `Learned that a footprint is only half the story.`
    },
    teaser: `Holmes had a rule: the law's business is the facts. But a rule is only as good as the man who keeps it.`
  };

  KIT.build({
    id: 'abbey', title: 'The Abbey Grange',
    cast: ['watson', 'hopkins', 'lady', 'theresa', 'croker'],
    suspects: ['lady', 'theresa', 'croker'],
    clues: CLUES, solution: { eustace: 'croker' }, episodes: [ep1, ep2],
    scoreRounds: [['f_eustace#1', 'eustace', 'Final']],
    truth: n => `Sir Eustace was killed by <b>${n.croker}</b>, defending Lady Brackenstall. Her maid and the lady helped to stage the burglary.`,
    endCard: 'CASE CLOSED', completeLabel: 'Case solved'
  });
})();

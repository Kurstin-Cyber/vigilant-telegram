/* The Blackwood Files, Season One. All story content lives here (spoilers inside). */
const STORY = (() => {
  const NAMES = {
    you: 'Inspector Ashby', edmund: 'Edmund Blackwood', pennington: 'Pennington', margaret: 'Lady Margaret',
    vivian: 'Vivian Cross', hale: 'Dr. Hale', dobbs: 'Mrs. Dobbs'
  };
  const SUSPECTS = ['pennington', 'margaret', 'vivian', 'hale', 'dobbs'];
  const SUSPECT_OPTIONS = SUSPECTS.map(id => ({ id, label: NAMES[id], portrait: id }));
  const SOLUTION = { edmund: 'margaret', hale: 'pennington' };

  const CLUES = {
    body: { icon: '🪑', name: `Edmund's body`, type: 'Evidence', text: `No wound, no blood, no struggle. Lips tinged blue, one hand clutching the chest. This was poison, not violence.` },
    brandyGlasses: { icon: '🥃', name: 'Two brandy glasses', type: 'Evidence', text: `Two used brandy glasses on the desk. Both smell only of brandy. Edmund drank with a visitor, and nothing in the brandy looks wrong.` },
    medicineGlass: { icon: '🧪', name: 'Silver medicine measure', type: 'Evidence', text: `Half hidden behind the lamp: a small silver measure with greenish, bitter-smelling dregs, beside a brown bottle labelled "Hale's Cardiac Tonic. One measure at night."` },
    watch: { icon: '⌚', name: 'Smashed pocket watch', type: 'Evidence', text: `Edmund's gold watch, glass cracked, hands frozen at 9:12.` },
    wallDent: { icon: '💥', name: 'Dent in the panelling', type: 'Evidence', text: `A fresh dent in the oak panelling beside the door, level with a man's shoulder, with a splinter of gold glass in it. The watch was thrown at the wall. It did not simply fall.` },
    ledger: { icon: '🔥', name: 'Ledger scrap on the ash', type: 'Evidence', text: `A scrap lying face-up on the cold ash at the grate's edge: "...Hartley Orphans' Fund... withdrawn, J.H.... £4,200... £3,800..." The edges are charred, but the writing is perfectly legible, as if the page had been laid there to be found.` },
    key: { icon: '🗝️', name: 'Brass key marked S', type: 'Evidence', text: `Hidden behind Bleak House in the library: a small brass key stamped with the letter S.` },
    letter: { icon: '✉️', name: 'Unsent letter to the solicitor', type: 'Evidence', text: `"Mr. Crane. On Monday I will take the thefts from the Hartley Orphans' Fund to the magistrate. The signatures on those withdrawals are forged. I have known the man thirty years and it grieves me. E.B."` },
    vivianLetter: { icon: '💌', name: `Vivian's allowance letter`, type: 'Evidence', text: `Edmund cut Vivian's allowance to nothing last week. The paper is spotted with tears.` },
    thursdays: { icon: '📒', name: 'The surviving ledger page', type: 'Evidence', text: `Withdrawals from the Orphans' Fund, always on the first Thursday of the month, signed "E. Blackwood", with a treasurer's countersignature beneath. The doctor visited every first Thursday. The "E" has an odd looped tail.` },
    ashtray: { icon: '🚬', name: 'Cold ashtray', type: 'Evidence', text: `The conservatory ashtray holds one old stub under a layer of dust. Nobody smoked in this room tonight.` },
    bagEmpty: { icon: '👜', name: `Hale's medical bag`, type: 'Evidence', text: `Dr. Hale's bag, left open in the conservatory. A velvet loop meant for a small vial hangs empty.` },
    vial: { icon: '🧫', name: 'Vial of digitalis', type: 'Evidence', text: `Found in Vivian's coat: a vial labelled "Tincture of Digitalis, J. Hale", nearly empty.` },
    foxglove: { icon: '🌿', name: 'Dried foxglove', type: 'Evidence', text: `A tin of dried foxglove leaves on Mrs. Dobbs's herb shelf. Foxglove is digitalis. She says Dr. Hale prescribed a tea of it for her swollen ankles.` },
    handwriting: { icon: '✍️', name: 'The forger’s hand', type: 'Evidence', text: `Lady Margaret's household accounts. The capital "E" has the same looped tail as the forged "E. Blackwood" on the Fund's withdrawals.` },
    confessionNote: { icon: '📄', name: 'Typed confession', type: 'Evidence', text: `Typed on the library machine: "I killed the Master. I cannot bear what I have done. Forgive me. J. Hale." Dr. Hale called his friend Edmund. Always.` },
    teaTray: { icon: '🍵', name: 'The supper tray', type: 'Evidence', text: `Soup bowl scraped clean. A teacup holds greenish dregs with the same bitter smell as the silver measure in the study.` },
    tonicShard: { icon: '🍾', name: 'Brown glass shard', type: 'Evidence', text: `In the fresh ash of the cellar furnace: a curved shard of brown glass with half a label: "...diac Tonic."` },
    digitalisRx: { icon: '💊', name: 'Edmund took digitalis', type: 'Testimony', text: `Dr. Hale volunteered that Edmund took digitalis for a weak heart, in a nightly tonic.` },
    fundTalk: { icon: '🗣️', name: `Margaret: "a rot in the fund"`, type: 'Testimony', text: `Edmund spent weeks muttering about "a rot in the fund". Dr. Hale handles the charity's books.` },
    vivianAlibi: { icon: '📚', name: `Vivian's alibi`, type: 'Testimony', text: `Vivian says she was alone in the library from half past eight until the gong at half past nine.` },
    haleAlibi: { icon: '🌿', name: `Hale's first alibi`, type: 'Testimony', text: `Hale first said he spent the evening in the conservatory with a cigar, and that Vivian kept him company until the gong.` },
    haleVivian: { icon: '❓', name: 'Vivian never saw Hale', type: 'Testimony', text: `Vivian says Hale never came near the library. His first alibi relied on her.` },
    decanterClean: { icon: '🍾', name: 'The decanter was sealed', type: 'Testimony', text: `Mrs. Dobbs: a freshly sealed decanter and a single glass went to the study at ten to nine.` },
    dobbsGlass: { icon: '🥂', name: 'Hale fetched a glass', type: 'Testimony', text: `Mrs. Dobbs: Dr. Hale came to the kitchen around nine for a clean glass, saying Edmund wanted company.` },
    penSaw: { icon: '👁️', name: 'Pennington saw Hale', type: 'Testimony', text: `Pennington saw Dr. Hale enter the study at five past nine with a glass, and leave around twenty past. He heard a crash at about nine twelve.` },
    penOath: { icon: '🕯️', name: `Pennington's vow`, type: 'Testimony', text: `Pennington, shaking: "Whoever did this to the Master, sir, I will see justice done. If it takes the rest of my life."` },
    haleLeft: { icon: '🚪', name: `Hale's account`, type: 'Testimony', text: `Hale admits the quarrel: Edmund accused him of forging the Fund's signatures, hurled his watch at the wall, and Hale left at twenty past nine. Edmund was alive, cursing him.` },
    trayFigure: { icon: '🚶', name: 'Someone with a tray', type: 'Testimony', text: `Vivian: around half past nine she saw someone carrying a tray into the study. Dark clothes. She only saw a back.` },
    vivianCoat: { icon: '🧥', name: `The vial in Vivian's coat`, type: 'Testimony', text: `Vivian: she found the vial in her coat pocket only after the gong, when she went for her gloves. The cloakroom was open to the whole house.` },
    tonicRitual: { icon: '🕰️', name: `The nightly tonic`, type: 'Testimony', text: `Mrs. Dobbs: since his heart turned, Lady Margaret takes Edmund's tonic up to the study herself at half past nine every night. She will not let anyone else do it.` },
    penBag: { icon: '🧳', name: `Who carried the bag`, type: 'Testimony', text: `Pennington: when the doctor arrived, Lady Margaret carried his bag to the cloakroom herself. He thought it a kind and unusual gesture.` },
    margaretSlip: { icon: '🤫', name: 'Margaret knew about Monday', type: 'Testimony', text: `Lady Margaret said Edmund meant to "go to the magistrate on Monday". The word "magistrate" appears only in the sealed letter in the drawer, which nobody has shown her.` },
    supperTray: { icon: '🍽️', name: 'Who carried the tray', type: 'Testimony', text: `Mrs. Dobbs: Pennington insisted on carrying Dr. Hale's supper up himself, and went back for the sugar bowl after she had covered the soup.` }
  };

  /* ----- step helpers ----- */
  const N = t => ({ nar: t });
  const S = (who, t, e) => ({ say: who, t, e });
  const Y = t => S('you', t);
  const show = (id, pos, e) => ({ show: id, pos, e });
  const hide = id => ({ hide: id });
  const clue = id => ({ clue: id });
  const sfx = n => ({ sfx: n });
  const slate = t => ({ slate: t });
  const flag = f => ({ flag: f });
  const flash = c => ({ flash: c });
  const shake = () => ({ shake: 1 });
  const voteOf = (key, title, qs) => ({ key, title, qs, options: SUSPECT_OPTIONS });

  /* ================= EPISODE 1 ================= */
  const ep1 = {
    n: 1, titleScene: 3, title: 'Snowbound', logline: 'A dead man, five people under one roof, and a blizzard that will not let anyone leave.',
    recap: [],
    scenes: [
      {
        id: 'cold1', bg: 'dining', amb: 'room', mood: 'calm', fx: 'dust',
        steps: [
          slate('Blackwood Manor · 8:52 PM'),
          N(`Dinner at Blackwood Manor. Snow at the windows, candles on the table, and a host who has been smiling all evening.`),
          show('vivian', 'l', 'n'), show('hale', 'cl', 'n'), show('edmund', 'c', 's'), show('margaret', 'cr', 'n'), show('pennington', 'r', 'n'),
          S('edmund', `Friends. Thirty years I have kept this table, and I have never once been sorry for it.`, 's'),
          S('edmund', `Tonight I am a happy man, because I have finally decided something that has troubled me for a month.`, 's'),
          N(`Across the table, a fork stops halfway to a mouth. A glass is set down a little too carefully. Nobody looks at anybody.`),
          S('edmund', `On Monday morning I shall put it right, and I shall thank you all to be at breakfast. Monday will be a day of reckoning.`),
          S('vivian', `Uncle? What do you mean?`, 'w'),
          S('edmund', `Monday, my dear. Not a word before. Pennington, brandy in the study. I shall not be disturbed until the gong.`, 's'),
          N(`He folds his napkin, kisses the top of Vivian's head, and leaves the room. The door clicks shut behind him.`),
          sfx('door'), hide('edmund'),
          S('hale', `Forgive me. I need some air.`, 'w'), hide('hale'),
          N(`Dr. Hale is gone before the plates are cleared.`),
          S('vivian', `I can't sit here. I shall be in the library.`, 'w'), hide('vivian'),
          S('margaret', `And I shall lie down with my headache. Pennington, you will see to dessert.`, 'n'), hide('margaret'),
          S('pennington', `Of course, my lady.`, 'n'),
          N(`The clock in the hall ticks toward nine. Nobody at that table knows it is the last ordinary hour Blackwood Manor will have.`)
        ]
      },
      {
        id: 'cold2', bg: 'study_alive', amb: 'fire', mood: 'dread', fx: 'dust',
        steps: [
          slate('The Study · 9:33 PM'),
          show('edmund', 'c', 'n'),
          N(`The study, half an hour later. The fire has burned low. A gold watch lies cracked on the floor, and the room feels as if someone has only just left it.`),
          N(`Edmund Blackwood sits very straight, like a man who has won an argument and does not feel like it.`),
          S('edmund', `Thirty years...`, 'w'),
          N(`He takes his medicine as he does every night: a small silver measure, a grimace at the bitterness, and he sets it down.`),
          N(`Then he frowns. He puts a hand flat against his chest, as if to hold something in.`),
          S('edmund', `Odd...`, 'sh'),
          sfx('hit'),
          S('edmund', `Not tonight. Monday. I only need until Monday...`, 'w'),
          shake(),
          N(`He tries to stand. The room tilts. He reaches for the bell pull and misses it by a foot.`),
          sfx('glass'),
          N(`He falls back into the leather chair, and for a moment he looks like a man listening to the fire.`),
          N(`The fire settles. In the hall, the clock goes on ticking. Edmund Blackwood does not move again.`),
          hide('edmund')
        ]
      },
      {
        id: 'cold3', bg: 'study', amb: 'fire', mood: 'dread', fx: 'dust',
        steps: [
          slate('The Study · 9:40 PM'),
          sfx('knock'),
          S('pennington', `Master? Dessert is... Master?`, 'n'),
          N(`Pennington waits. Knocks again. Opens the door.`),
          sfx('door'),
          show('pennington', 'c', 'w'),
          S('pennington', `Sir?`, 'w'),
          N(`He crosses the room. He touches the old man's wrist, and holds it for a very long time.`),
          S('pennington', `Oh, sir. Oh, no.`, 'sh'),
          sfx('hit'),
          N(`Within the hour, a stable boy will be riding through the blizzard to fetch the only policeman for ten miles.`)
        ]
      },
      {
        id: 'arrival', bg: 'exterior', amb: 'wind', mood: 'calm', fx: 'snow',
        steps: [
          slate('Blackwood Manor · December 1926 · 10:34 PM'),
          N(`A stable boy rode through the blizzard to the village inn, white with snow, and gasped three words: "Mr. Blackwood. Dead."`),
          N(`You followed his lantern for two miles. Now the carriage groans to a stop before the great house, every window blazing, and the road behind you has already disappeared.`),
          sfx('knock'),
          show('pennington', 'c', 'w'),
          S('pennington', `Inspector. Thank God. I am Pennington, the butler.`),
          S('pennington', `Mr. Edmund Blackwood is dead. The household is in the dining room. Nobody has left, and nobody can. The drifts closed the road at nine.`),
          Y(`And the telephone?`),
          S('pennington', `Dead since eight, sir. The wires are down. You are all the law this house has tonight.`, 'w'),
          { choice: { prompt: 'How do you take charge?', opts: [
            { t: `Gently. "You've had a shock. Take a breath, then tell me what you saw."`, steps: [flag('kind'), S('pennington', `Thank you, sir. That is more kindness than I expected tonight.`)] },
            { t: `Briskly. "Nobody touches anything. Take me to the body."`, steps: [flag('brisk'), S('pennington', `Of course, sir. At once.`)] },
            { t: `Pointedly. "You found him. Start there. Leave nothing out."`, steps: [flag('pointed'), S('pennington', `At twenty to ten I knocked to announce dessert. No answer. I went in, sir, and he was sitting there as if he were listening.`, 'w')] }
          ] } },
          S('pennington', `Thirty-one years I have served this house, sir. I shall not forget tonight as long as I live.`),
          N(`He lifts a lantern and leads you inside. Behind you, the storm closes over the door like a lid.`),
          sfx('door')
        ]
      },
      {
        id: 'study', bg: 'study', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Study · 10:41 PM'),
          N(`Edmund Blackwood sits in his leather chair, head tilted, as though the fire had said something he was still considering.`),
          show('pennington', 'l', 'w'),
          S('pennington', `I have touched nothing, sir. Only the door, and the Master's wrist, to be certain.`),
          Y(`Wait outside, Pennington. I'll call for you.`),
          hide('pennington'),
          N(`Alone with the dead, you begin the oldest ritual of your trade: look before you think.`),
          { menu: { prompt: 'Examine the study', style: 'scene', must: 'Find the body, the desk, the lamp and the fireplace first.', done: `I've seen enough.`, items: [
            { id: 'body', icon: '🪑', label: 'The body', must: true, steps: [
              N(`No wound. No blood. Nothing overturned. His lips have a faint blue tinge, and his right hand is curled against his waistcoat as if he had tried to hold his heart in.`),
              Y(`A struggle would have left a mark. This is poison.`), clue('body')] },
            { id: 'desk', icon: '🥃', label: 'The desk', must: true, steps: [
              N(`Two crystal brandy glasses stand side by side on the blotter. You lift each in turn. Both smell only of brandy. The decanter's seal is broken, but it is nearly full.`),
              Y(`If this is poison, it isn't in the brandy.`), clue('brandyGlasses')] },
            { id: 'lamp', icon: '🪔', label: 'Behind the lamp', must: true, steps: [
              N(`Half hidden behind the lamp stands a small silver measure, the kind a household uses for medicine. The dregs are greenish and smell sharply bitter.`),
              Y(`Edmund took something here, and not long ago.`), clue('medicineGlass')] },
            { id: 'floor', icon: '⌚', label: 'The floor', steps: [
              N(`A gold pocket watch lies by the leg of the chair. The glass is cracked, and the hands have stopped at 9:12.`),
              Y(`Nine twelve. The moment he fell, presumably.`), clue('watch')] },
            { id: 'wall', icon: '🧱', label: 'The wall by the door', steps: [
              N(`A fresh dent in the oak panelling, level with a man's shoulder. A splinter of gold-tinted glass is wedged in it.`),
              Y(`That glass is from the watch. It was thrown, not dropped.`), clue('wallDent')] },
            { id: 'grate', icon: '🔥', label: 'The fireplace', must: true, steps: [
              N(`At the grate's edge, face-up on the cold ash, lies a scrap of paper. Charred at the corners. The writing is perfectly clear.`),
              Y(`Whoever burned this left the most important part readable. Careless? Or meant to be read?`), clue('ledger')] },
            { id: 'window', icon: '🪟', label: 'The window', steps: [
              N(`Latched from the inside. The snow on the sill is smooth and unbroken.`),
              Y(`Nobody came or went this way. Whoever did this was already under this roof.`)] },
            { id: 'opener', icon: '🗡️', label: 'The letter opener', steps: [
              N(`Clean steel in a leather holder. Not the weapon.`)] },
            { id: 'drawer', icon: '🗄️', label: 'The locked drawer', once: false, steps: [
              N(`The desk's bottom drawer has a small brass lock. There is no key on Edmund, and none in the room.`),
              Y(`He locked something away. I need to find that key.`), flag('sawDrawer')] }
          ] } },
          N(`Poison. A visitor who drank brandy with him. Medicine taken at the wrong hour. A name burned down to its initials. Someone in this house sat close to Edmund Blackwood tonight and watched him die.`),
          sfx('stinger')
        ]
      },
      {
        id: 'gathering', bg: 'dining', amb: 'room', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Dining Room · 11:05 PM'),
          N(`Six places laid. Candles guttering. Three faces turn as you enter, and each wears a different kind of fear.`),
          show('vivian', 'l', 'w'), show('margaret', 'c', 'w'), show('hale', 'r'),
          S('margaret', `Inspector. Is it true? They say Edmund simply... stopped.`, 'w'),
          Y(`Lady Blackwood, I am sorry. Your husband did not simply stop. He was poisoned.`),
          sfx('gasp'),
          S('vivian', `Poisoned?! Here? With all of us sitting in this house?`, 'sh'),
          S('hale', `Steady, Vivian. Please, steady.`),
          S('hale', `Inspector, I am Dr. Julian Hale, the family physician. Pennington fetched me to the study at a quarter to ten and I confess I thought it his heart. Edmund took digitalis for a weak heart, in a nightly tonic of my own mixing. A misjudged dose, perhaps...`),
          clue('digitalisRx'),
          Y(`Perhaps. Or perhaps someone measured it for him.`),
          S('hale', `Dear God. You cannot mean one of us.`, 'w'),
          N(`Nobody answers. Outside, the wind finds a loose shutter and worries it like a dog.`),
          S('vivian', `You can't keep us here! I won't sit in a room with... with whoever...`, 'a'),
          S('margaret', `Vivian. Sit down. The Inspector is right to ask.`),
          Y(`Nobody leaves this house tonight. I will speak with each of you alone.`)
        ]
      },
      {
        id: 'interviews', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Drawing Room · 11:30 PM'),
          N(`You take the drawing room and send for them one at a time. Truth has a different sound in every voice.`),
          { menu: { prompt: 'Whom will you question?', style: 'scene', must: 'Speak to all three before you go.', done: `I have what I need.`, items: [
            { id: 'margaret', icon: '👵', label: 'Lady Margaret', must: true, steps: [
              show('margaret', 'c', 'n'),
              S('margaret', `Ask what you must, Inspector. I have nothing to hide but my grief.`),
              { menu: { prompt: 'Ask Lady Margaret...', style: 'talk', must: 'Ask where she was at nine.', done: `That will do for now.`, items: [
                { id: 'm_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('margaret', `In this room, with a headache. Alone. I know how that sounds, Inspector.`, 'w'), flag('margaretAlone')] },
                { id: 'm_worry', label: `"Was Edmund troubled lately?"`, steps: [
                  S('margaret', `For weeks he shut himself away, muttering about "a rot in the fund". The Hartley Orphans' Fund, his great pride.`),
                  S('margaret', `Julian keeps the charity's books, so I assumed Edmund was consulting him.`), clue('fundTalk')] },
                { id: 'm_marriage', label: `"How were things between you?"`, steps: [
                  S('margaret', `Civil. Thirty years of civility. He was hard, not cruel.`),
                  S('margaret', `He cut Vivian's allowance last week. I begged him not to.`, 'w')] }
              ] } },
              hide('margaret')] },
            { id: 'vivian', icon: '👩', label: 'Vivian Cross', must: true, steps: [
              show('vivian', 'c', 'a'),
              S('vivian', `I didn't do it. Whatever Uncle did to my allowance, I didn't do it.`, 'a'),
              { menu: { prompt: 'Ask Vivian...', style: 'talk', must: 'Ask where she was at nine.', done: `That will do for now.`, items: [
                { id: 'v_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('vivian', `In the library, from half past eight until the gong at half past nine. Alone. Reading.`), clue('vivianAlibi')] },
                { id: 'v_money', label: `"Your uncle cut your allowance."`, steps: [
                  S('vivian', `Yes, and I was furious. I cried in the hall like a child. But furious isn't murderous, Inspector.`, 'w')] },
                { id: 'v_uncle', label: `"What was he like?"`, steps: [
                  S('vivian', `He raised me after my parents died. Strict, impossible, and he sat up with me every time I had a nightmare.`, 'w')] }
              ] } },
              hide('vivian')] },
            { id: 'hale', icon: '🧑‍⚕️', label: 'Dr. Hale', must: true, steps: [
              show('hale', 'c', 'n'),
              S('hale', `Dreadful business, Inspector. Dreadful. Edmund was my oldest friend.`),
              { menu: { prompt: 'Ask Dr. Hale...', style: 'talk', must: 'Ask where he was at nine.', done: `That will do for now.`, items: [
                { id: 'h_where', label: `"Where were you at nine?"`, must: true, steps: [
                  S('hale', `In the conservatory, among the orchids, with a cigar. Miss Cross was kind enough to keep me company until the gong at half past nine.`), clue('haleAlibi')] },
                { id: 'h_bag', label: `"You carry digitalis, Doctor."`, steps: [
                  S('hale', `As any physician does, Inspector. Which is precisely why I told you about it at once.`),
                  Y(`It was convenient of you to mention it.`),
                  S('hale', `It was honest of me to mention it. There is a difference.`, 'w')] },
                { id: 'h_friend', label: `"How well did you know him?"`, steps: [
                  S('hale', `Thirty years his physician and his friend. I held his hand when his father died.`)] }
              ] } },
              hide('hale')] }
          ] } },
          N(`Three alibis. None of them sealed. Somewhere in this house, one of them is a performance.`)
        ]
      },
      {
        id: 'library', bg: 'library', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Library · 12:02 AM'),
          N(`Unable to sleep, and unwilling to, you walk the house alone. The library is empty, its fire burned down to a red eye. A grandfather clock counts the dead hours.`),
          sfx('chime'),
          { menu: { prompt: 'Search the library', style: 'scene', must: 'Check the shelves first.', done: 'Take what you found and return to the study.', items: [
            { id: 'shelf', icon: '📖', label: 'The shelves', must: true, steps: [
              N(`Among the Dickens, one spine sits half an inch proud of the rest. Bleak House. Behind it, wrapped in a handkerchief, lies a small brass key stamped with an S.`),
              Y(`S for Study. Edmund hid his key in plain sight.`), clue('key')] },
            { id: 'writing', icon: '✉️', label: 'The writing desk', steps: [
              N(`A letter in Edmund's hand, addressed to Vivian. Her allowance, cut to nothing until she "shows some sense". The paper is spotted with tears.`), clue('vivianLetter')] },
            { id: 'clock', icon: '🕰️', label: 'The grandfather clock', steps: [
              N(`It strikes the quarter hours loud enough to hear through a closed door. Anyone sitting in this room at half past nine would have heard the dinner gong ring in the hall.`)] }
          ] } }
        ]
      },
      {
        id: 'drawer', bg: 'study', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Study · 12:20 AM'),
          N(`The key turns with a click that is louder than it has any right to be.`),
          N(`Inside the drawer lies a single folded sheet, the ink still glossy, never sent.`),
          clue('letter'),
          Y(`Thirty years. "The man I have known thirty years."`),
          N(`In this house, that describes more than one person.`),
          { choice: { prompt: 'Whom do you mean to watch tonight?', opts: [
            { t: `Lady Margaret. Thirty years his wife.`, steps: [flag('watchMargaret'), Y(`The widow with no alibi. She can't stay in her room forever.`)] },
            { t: `Dr. Hale. Thirty years his friend and physician.`, steps: [flag('watchHale'), Y(`The doctor who mentioned the poison before I could ask.`)] },
            { t: `Pennington. Thirty-one years in service.`, steps: [flag('watchPennington'), Y(`The man who found the body, and touched the wrist, and the door.`)] }
          ] } },
          N(`You put out the lamp. The house settles around you like a held breath.`),
          N(`You had meant to keep watch from the corridor. But the sound that stops you does not come from there. It comes from beneath your feet: a heavy door, softly closed.`),
          sfx('door')
        ]
      },
      {
        id: 'cellar', bg: 'cellar', amb: 'furnace', mood: 'dread', fx: 'embers',
        steps: [
          slate('The Cellar · 12:41 AM'),
          N(`The cellar stairs are steep, and your lamp throws your shadow ahead of you like a scout.`),
          sfx('steps'),
          N(`At the bottom, the furnace door hangs open and the whole room is orange. A figure kneels before it, feeding the fire page by page.`),
          sfx('hit'),
          show('pennington', 'c', 'w'),
          Y(`Pennington.`),
          N(`He does not startle. He turns slowly, a handful of ledger pages in one hand, and the firelight carves his face into something older and stranger than the butler who met you at the door.`),
          S('pennington', `Inspector. It is not what you think.`, 'w'),
          Y(`Then tell me what I am thinking.`),
          S('pennington', `Please. Ask me to stop and I shall. But if you read these pages, sir, you will understand why I could not let anyone see them.`, 'w'),
          N(`Behind him, in the furnace, the last page of Edmund Blackwood's account book curls and blackens, and takes its secret with it.`),
          { cliff: 'pennington' }
        ]
      }
    ],
    vote: voteOf('r1', 'Episode 1 verdict', [{ id: 'edmund', text: 'Who do you think killed Edmund Blackwood?' }]),
    watch: {
      pennington: `Caught burning ledger pages in the cellar at 12:41 AM.`,
      margaret: `No alibi. Knew Edmund was troubled about "the fund".`,
      vivian: `Allowance cut last week. Says she was alone in the library.`,
      hale: `Volunteered the digitalis. Claims Vivian shared his alibi.`,
      dobbs: `The cook. Not yet questioned.`
    },
    teaser: `Next: Pennington's explanation, a doctor who lies, and a vial that turns up where it should not be.`
  };

  /* ================= EPISODE 2 ================= */
  const ep2 = {
    n: 2, title: 'Ashes', logline: 'The butler talks. The doctor lies. Someone in the house is arranging the evidence.',
    recap: [
      `Edmund Blackwood, poisoned, with brandy shared and medicine taken.`,
      `A burnt scrap: "Hartley Orphans' Fund... J.H."`,
      `A letter: "I have known the man thirty years."`,
      `And in the cellar, Pennington was feeding the furnace.`
    ],
    scenes: [
      {
        id: 'cellar2', bg: 'cellar', amb: 'furnace', mood: 'dread', fx: 'embers',
        steps: [
          slate('The Cellar · 12:43 AM'),
          show('pennington', 'c', 'w'),
          Y(`Put the pages down, Pennington. Slowly.`),
          N(`He lowers them as if they were asleep. The furnace roars.`),
          { choice: { prompt: 'How do you handle him?', opts: [
            { t: `"Every page. Now."`, steps: [flag('pressedPen'), S('pennington', `There is only one left, sir. Please do not shout. I have heard enough shouting tonight.`, 'w')] },
            { t: `"Tell me why, Pennington. From the beginning."`, steps: [flag('softPen'), S('pennington', `You are kind, sir. Kinder than I deserve.`)] }
          ] } },
          S('pennington', `I found the Master dead, and on his desk lay his private account book, open, as if someone had been reading it in haste. I took it before I called anyone.`),
          S('pennington', `I saw the Master's signature on withdrawal after withdrawal from the Orphans' Fund. I thought: he was robbing the children and was ashamed of it. I would not let the world say that of him.`, 'w'),
          Y(`You burned the book to save his name.`),
          S('pennington', `Thirty-one years he gave me a home, sir. It seemed the last service I could do him.`),
          S('pennington', `I burned all but one page. I could not make my hands do it.`),
          N(`He holds out a single, soot-edged sheet. Dates. Sums. A signature.`),
          clue('thursdays'),
          Y(`"E. Blackwood." And yet his own letter says the signatures were forged.`),
          S('pennington', `Forged? I never... I did not think of that, sir. I only saw his name, and feared for the family's honour.`, 'sh'),
          Y(`Every one of these falls on a first Thursday. Who visits Blackwood Manor on a first Thursday?`),
          S('pennington', `Why, the doctor, sir. For the Master's heart. They always sat with the books afterwards.`),
          N(`The furnace ticks as it cools. Neither of you says the name.`),
          S('pennington', `Sir, if someone in this house did that to the Master... I will see justice done. If it takes the rest of my life.`, 'a'),
          clue('penOath'),
          Y(`Justice is my work, Pennington. Not yours. Go to bed.`),
          S('pennington', `Yes, sir.`, 'w'),
          hide('pennington')
        ]
      },
      {
        id: 'library2', bg: 'library', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Library · 6:15 AM'),
          N(`Dawn comes grey and sullen. The snow has stopped, but the world outside is a white wall.`),
          show('vivian', 'c', 'w'),
          S('vivian', `You haven't slept either, Inspector.`),
          { menu: { prompt: 'Ask Vivian...', style: 'talk', must: 'Ask about Dr. Hale.', done: `I'll let you rest.`, items: [
            { id: 'v2_hale', label: `"Dr. Hale says you kept him company in the conservatory."`, must: true, steps: [
              S('vivian', `The conservatory? With Dr. Hale? I never left this room until the gong.`, 'sh'),
              Y(`You're certain?`),
              S('vivian', `I was reading the same page for an hour. I never saw him. Why would he say that?`, 'w'),
              clue('haleVivian')] },
            { id: 'v2_night', label: `"Did you sleep?"`, steps: [
              S('vivian', `Not a minute. Every time I close my eyes, I hear Uncle laughing at dinner. He was in such a good mood.`, 'w'),
              S('vivian', `He said Monday would be "a day of reckonings". I thought he meant me.`)] },
            { id: 'v2_hide', label: `"Is there anything you've left out?"`, steps: [
              S('vivian', `...No. Nothing. I stood up to stretch, that's all. It's nothing.`, 'w'),
              N(`She says it too quickly, and looks at the door instead of at you.`)] }
          ] } },
          N(`A man who lies about his alibi has a reason. A girl who hides something has another. You mean to find both.`),
          hide('vivian')
        ]
      },
      {
        id: 'conservatory', bg: 'conservatory', amb: 'room', mood: 'tense', fx: 'snow',
        steps: [
          slate('The Conservatory · 7:02 AM'),
          N(`Glass walls, wet air, rows of orchids. Dr. Hale's alibi lives here, if it lives anywhere.`),
          { menu: { prompt: 'Search the conservatory', style: 'scene', must: `Check the ashtray and the doctor's bag.`, done: 'I have what I came for.', items: [
            { id: 'ashtray', icon: '🚬', label: 'The ashtray', must: true, steps: [
              N(`A glass ashtray on the bench. One stub, old, cold, furred with dust. There is no fresh ash and no smell of cigar anywhere in the room.`),
              Y(`Nobody smoked in here last night.`), clue('ashtray')] },
            { id: 'bag', icon: '👜', label: `Dr. Hale's bag`, must: true, steps: [
              N(`The black medical bag lies open on the bench. Stethoscope. Bandages. And a row of velvet loops for small glass vials. One loop hangs empty.`),
              Y(`Something is missing from the doctor's bag.`), clue('bagEmpty')] },
            { id: 'orchids', icon: '🌺', label: 'The orchids', steps: [
              N(`Edmund's prize blooms. The soil is undisturbed. Whatever this room is hiding, it is not hiding it here.`)] }
          ] } },
          sfx('door'),
          show('hale', 'c', 'n'),
          S('hale', `You are up early, Inspector. I came to see to my orchids. Edmund would have wanted them looked after.`),
          Y(`You told me you spent last night here, Doctor. With a cigar.`),
          S('hale', `I did.`),
          { present: { prompt: `Challenge Dr. Hale's alibi`, ok: ['ashtray', 'haleVivian'], hint: 'Something in this room, or something Vivian said.', cost: 0,
            right: [
              S('hale', `Ah.`, 'w'),
              N(`For a moment nothing in his face moves. Then something gives, the way a held breath gives.`),
              S('hale', `I lied. Of course I lied. I knew precisely how it would look: the family doctor, the digitalis, a man who had quarrelled with the deceased an hour before he died.`, 'w'),
              S('hale', `Edmund sent for me at five past nine. He accused me to my face of forging the Fund's signatures. Thirty years, Inspector, and he believed it of me in a single evening.`),
              S('hale', `I swore on everything I have that I had never touched a penny. He threw his watch at the wall. It struck the panelling beside my head. I left at twenty past, and he was alive. Alive, and cursing me.`, 'a'),
              clue('haleLeft'),
              S('hale', `Then I came here and sat in the dark like a fool, because I could not face the dining room.`, 'w')
            ],
            wrong: () => [S('hale', `I'm afraid I don't follow, Inspector.`)] } },
          Y(`You expect me to believe you are innocent.`),
          S('hale', `I expect nothing. But I am the treasurer of that Fund, Inspector. My initials are on every page of it. Whoever burned that scrap knew exactly whose name to leave legible.`, 'a'),
          N(`It is the sharpest thing anyone has said all night, and you cannot tell whether it is the truth or a very good lie.`),
          hide('hale')
        ]
      },
      {
        id: 'kitchen', bg: 'kitchen', amb: 'kitchen', mood: 'tense', fx: 'embers',
        steps: [
          slate('The Kitchen · 8:20 AM'),
          N(`Breakfast is a rumour. Mrs. Dobbs bangs a pot out of habit rather than hope.`),
          show('dobbs', 'l', 'w'), show('pennington', 'r', 'n'),
          S('dobbs', `Whatever's happened upstairs, Inspector, it never happened in my kitchen.`),
          { menu: { prompt: 'Question the staff', style: 'talk', must: 'Show them what you found in the study.', done: 'That is all, thank you.', items: [
            { id: 'k_decanter', label: `"Could the brandy have been tampered with?"`, steps: [
              S('dobbs', `Not here. Pennington took a sealed decanter at ten to nine, and one glass.`),
              clue('decanterClean')] },
            { id: 'k_glass', label: `Show Mrs. Dobbs the brandy glasses.`, must: true, steps: [
              { present: { prompt: 'Show Mrs. Dobbs', ok: ['brandyGlasses'], hint: 'Something from the desk.', right: [
                S('dobbs', `Two glasses? I sent one. But Dr. Hale popped his head in about nine, asking for a clean glass. "Edmund wants company," he says. I gave him one from the rack.`, 'sh'),
                clue('dobbsGlass')],
                wrong: () => [S('dobbs', `That's not my business, dear.`)] } }] },
            { id: 'k_pen', label: `Press Pennington on the study.`, must: true, steps: [
              S('pennington', `I would rather not accuse a guest, sir. It is not my place.`, 'w'),
              { present: { prompt: 'Show Pennington something from the study', ok: ['brandyGlasses', 'watch'], hint: `Something from Edmund's desk, or the floor.`, right: [
                S('pennington', `Then I must speak. At five past nine I saw Dr. Hale go into the study carrying a glass. I heard a crash from inside at about twelve past. He came out about twenty past. I thought nothing of it. He is a guest, and the Master's friend.`),
                clue('penSaw')],
                wrong: () => [S('pennington', `I do not see how that bears on it, sir.`)] } }] },
            { id: 'k_herbs', label: `The herb shelf.`, steps: [
              N(`Among the thyme and bay sits a battered tin. Inside, dried grey-green leaves: foxglove.`),
              Y(`Mrs. Dobbs. Foxglove is digitalis.`),
              S('dobbs', `And I know it, dear! Dr. Hale prescribed me a tea of it for my ankles. Ask him. I'd sooner poison myself than the Master.`, 'a'),
              clue('foxglove')] }
          ] } },
          hide('dobbs'), hide('pennington'),
          Y(`Hale took a clean glass at nine and walked into the study with it. He admits it now. But a man can walk into a room and out of it, and the poison can still be someone else's.`),
          sfx('door'),
          show('margaret', 'c', 'w'),
          S('margaret', `Inspector. A word. Julian is a weak man, I have always said so, but never a wicked one.`),
          S('margaret', `Whereas Vivian... I hate to say it. She has been so strange since Edmund cut her. Have you looked in her room?`, 'w'),
          Y(`You think I should.`),
          S('margaret', `I think a guilty conscience leaves things lying about. That is all.`),
          hide('margaret')
        ]
      },
      {
        id: 'bedroom', bg: 'bedroom', amb: 'room', mood: 'dread', fx: 'dust',
        steps: [
          slate(`Vivian Cross's Room · 9:05 AM`),
          N(`A narrow bed. A half-packed suitcase. A coat on a hook that still smells of the cold.`),
          { menu: { prompt: 'Search the room', style: 'scene', must: 'Check the coat.', done: 'Hold the vial up to the light.', items: [
            { id: 'case', icon: '🧳', label: 'The suitcase', steps: [
              N(`Two dresses, a hairbrush, a train timetable folded to Monday morning.`),
              Y(`She was planning to leave. Or planning to be somewhere on Monday.`)] },
            { id: 'coat', icon: '🧥', label: 'The coat', must: true, steps: [
              N(`In the right pocket, behind a glove: a small glass vial, stoppered with wax. The label is handwritten. "Tincture of Digitalis. J. Hale."`),
              sfx('stinger'), clue('vial')] },
            { id: 'dresser', icon: '🪞', label: 'The dresser', steps: [
              N(`Ribbons, a photograph of two smiling strangers, and a faded child's drawing of a house. It is signed "Uncle E."`)] }
          ] } },
          sfx('door'),
          show('vivian', 'l', 'sh'), show('margaret', 'c', 'w'), show('hale', 'r', 'w'),
          S('vivian', `What are you doing in my... `, 'sh'),
          N(`She sees the vial in your hand and stops dead.`),
          S('vivian', `No. No, that isn't mine. I've never seen that in my life!`, 'sh'),
          S('margaret', `Vivian. Oh, child.`, 'w'),
          S('hale', `That is my vial. Inspector, it came from my bag. I did not give it to her.`, 'sh'),
          S('vivian', `Nobody believes me. Nobody ever... `, 'a'),
          shake(), sfx('slam'),
          N(`She is out of the room before anyone can move. Feet on the stairs. A door at the bottom, flung wide. A gust of snow-wind through the whole house.`),
          S('margaret', `Vivian! Vivian, come back!`, 'sh'),
          N(`You start for the stairs. Behind you, someone lets out a breath. Not a gasp of shock. A breath of relief.`),
          N(`You do not turn around in time to see whose.`),
          { cliff: 'vivian' }
        ]
      }
    ],
    vote: voteOf('r2', 'Episode 2 verdict', [{ id: 'edmund', text: 'Who do you think killed Edmund Blackwood?' }]),
    watch: {
      pennington: `Cleared of burning evidence for himself. Swore to see "justice done".`,
      margaret: `Steered you toward Vivian's room. Still has no alibi.`,
      vivian: `Fled into the blizzard with the vial found in her coat.`,
      hale: `Lied about his alibi. Admits quarrelling with Edmund. Says he was framed.`,
      dobbs: `Keeps foxglove, but says the doctor prescribed it.`
    },
    teaser: `Next: a chase across the ice, a thread that doesn't tie, and a locked room.`
  };

  /* ================= EPISODE 3 ================= */
  const ep3 = {
    n: 3, title: 'Thin Ice', logline: 'A girl on the run. A man on trial in his own house. A door that was locked from the outside.',
    recap: [
      `Edmund was poisoned, and the evidence points everywhere at once.`,
      `Dr. Hale lied about his alibi, then said he was being framed.`,
      `Pennington swore he would see justice done.`,
      `A vial turned up in Vivian's coat, and Vivian ran into the snow.`
    ],
    scenes: [
      {
        id: 'snow', bg: 'garden', amb: 'wind', mood: 'storm', fx: 'snow',
        steps: [
          slate('The Grounds · 9:20 AM'),
          N(`The cold is a physical blow. Her footprints run toward the frozen lake and the boathouse, filling in even as you follow them.`),
          sfx('thunder'),
          N(`You find her crouched against the boathouse wall, knees drawn up, her scarf the only colour in the whole white world.`),
          show('vivian', 'c', 'w'),
          { choice: { prompt: 'How do you approach her?', opts: [
            { t: `Sit beside her in the snow. "I don't think you did this."`, steps: [flag('gentleViv'), S('vivian', `Nobody has said that to me all night.`, 'w')] },
            { t: `Stand firm. "Running makes you look guilty. Talk to me."`, steps: [flag('firmViv'), S('vivian', `I know how it looks! That's why I ran!`, 'a')] }
          ] } },
          S('vivian', `I found that bottle in my coat pocket after the gong. I'd gone to the cloakroom for my gloves. I knew exactly what it would look like. I was going to throw it in the lake.`),
          clue('vivianCoat'),
          Y(`The cloakroom is open to the whole house. Anyone could have put it there.`),
          S('vivian', `That's what frightens me.`, 'w'),
          Y(`You were holding something back this morning. I need it now.`),
          S('vivian', `I stood up from my book at half past nine. I heard a door in the corridor and went to the library doorway.`),
          S('vivian', `Somebody was going into the study carrying a tray. Dark clothes. I only saw a back. I thought it was Pennington, and I went back to my chair.`, 'w'),
          clue('trayFigure'),
          Y(`You didn't say so because...`),
          S('vivian', `Because if it was Pennington, it was nothing. And if it wasn't, I didn't want to be the one who saw.`),
          Y(`Come back with me, Vivian. We are going to finish this.`),
          S('vivian', `And if you're wrong?`),
          Y(`Then I'll be the first thing the snow covers.`),
          N(`She takes your hand. Above the lake, the sky is the colour of old pewter.`),
          hide('vivian')
        ]
      },
      {
        id: 'aftermath', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Drawing Room · 11:10 AM'),
          N(`The household gathers, because you asked them to. Everyone stands very still, the way people do when each of them has decided not to be the first to speak.`),
          show('vivian', 'l', 'w'), show('hale', 'cl', 'w'), show('margaret', 'cr', 'n'), show('pennington', 'r', 'n'),
          S('hale', `Inspector. I did not poison Edmund. I did not forge those signatures. I did not put that vial in the girl's coat. I am telling you the truth.`, 'a'),
          S('margaret', `Julian, please. Every word you say makes it worse.`),
          S('pennington', `The Master was a good man, sir. Someone in this room is not.`, 'a'),
          N(`The room waits for you. Everyone is looking at you. And you realise that, for the first time since you arrived, you are not sure what you think.`),
          { vote: { key: 'p3', title: 'A moment of doubt', intro: 'Dr. Hale has sworn he is innocent. Do you believe him?', qs: [{ id: 'trust', text: 'Do you believe Dr. Hale?' }],
            options: [{ id: 'yes', label: 'Yes. He is telling the truth.' }, { id: 'no', label: 'No. He is lying.' }, { id: 'unsure', label: 'I cannot tell.' }] } },
          { switch: () => G.verdict.trust, cases: {
            yes: [Y(`I believe you, Doctor. That does not make you safe. Somebody has gone to great trouble to make you look guilty.`)],
            no: [Y(`I don't believe you, Doctor. But belief isn't proof, and I will have proof.`)],
            unsure: [Y(`I cannot decide whether you are a liar or a very unlucky man, Doctor. That is a dangerous place to leave a case.`)]
          } },
          N(`Whatever you believe, one fact is plain: a man with a motive, a lie and a missing vial cannot be left to wander a house where someone has already killed.`),
          Y(`Dr. Hale, you will wait in the library. I will lock the door and keep the key myself.`),
          S('hale', `Then I shall wait. But I will say this once more: look at who has been steering you.`, 'a'),
          S('pennington', `There is a spare on the board in the pantry, sir, as there is for every door. I shall see it is not touched.`),
          N(`The key turns. It is a very ordinary sound.`),
          hide('hale'), hide('vivian'), hide('margaret'), hide('pennington')
        ]
      },
      {
        id: 'afternoon', bg: 'kitchen', amb: 'kitchen', mood: 'tense', fx: 'embers',
        steps: [
          slate('Afternoon · 3:30 PM'),
          N(`The light dies early in December. You spend what is left of it pulling on every thread you've been handed, and seeing which ones come away in your hand.`),
          { menu: { prompt: 'Afternoon inquiries', style: 'scene', must: 'Ask about the tonic, the doctor\'s bag and Lady Margaret\'s papers before evening.', done: 'Enough for one day.', items: [
            { id: 'a_tonic', icon: '🧪', label: 'Show Mrs. Dobbs the medicine measure', must: true, steps: [
              show('dobbs', 'c', 'n'),
              S('dobbs', `Ask what you like, dear. My hands are busy but my ears are free.`),
              { present: { prompt: 'Show Mrs. Dobbs', ok: ['medicineGlass'], hint: 'Something small and silver from the study.', right: [
                S('dobbs', `That's the Master's tonic measure! I wash it every morning. Her ladyship takes his tonic up herself, half past nine every night since his heart turned. Won't let me or Pennington touch it.`, 'sh'),
                clue('tonicRitual'),
                Y(`Every night?`),
                S('dobbs', `Every night, dear. It's the one kindness she did him.`)],
                wrong: () => [S('dobbs', `I can't see what that's to do with me, dear.`)] } },
              hide('dobbs')] },
            { id: 'a_bag', icon: '🧳', label: 'Ask Pennington about the doctor\'s bag', must: true, steps: [
              show('pennington', 'c', 'n'),
              Y(`When Dr. Hale arrived last night, where did his bag go?`),
              S('pennington', `To the cloakroom, sir. Her ladyship carried it there herself. I thought it a kind thing, and not like her.`),
              clue('penBag'),
              hide('pennington')] },
            { id: 'a_desk', icon: '📚', label: `Lady Margaret's writing desk`, must: true, steps: [
              N(`A tidy desk in a tidy room. A household account book in a firm, upright hand. You open it beside the soot-edged page Pennington saved.`),
              { if: () => has('thursdays'), then: [
                N(`The capital E in "Edmund" has a looped tail, exactly like the one on the signatures. You look from one to the other three times.`),
                Y(`That is not Edmund's hand, and it is not the doctor's.`),
                clue('handwriting')
              ], else: [
                N(`A careful hand, nothing remarkable. If you had the other ledger page to compare, it might mean something.`)
              ] }] },
            { id: 'a_margaret', icon: '👵', label: 'Speak with Lady Margaret', steps: [
              show('margaret', 'c', 'w'),
              S('margaret', `I have told you everything I know, Inspector.`),
              Y(`Edmund never told you what he meant to do?`),
              S('margaret', `Only that on Monday he was going to the magistrate. He wouldn't say about whom. I begged him to wait.`, 'w'),
              N(`The word hangs in the air. You are certain you have not said it to her. The only place it is written is on a letter that was locked in a drawer.`),
              clue('margaretSlip'),
              hide('margaret')] }
          ] } },
          N(`Four threads. Each one is thin. Together they pull in a direction you do not like.`)
        ]
      },
      {
        id: 'death', bg: 'library', amb: 'clock', mood: 'dread', fx: 'dust',
        steps: [
          slate('The Library · 7:12 PM'),
          N(`At seven you carry the doctor's supper tray to the library door. It is heavy with soup and tea, and it is the first thing in two days that has felt like kindness.`),
          sfx('steps'),
          N(`The key is in your pocket. You have not let it out of your hand. It turns easily.`),
          sfx('door'),
          N(`Dr. Hale sits at the writing desk with his head on his arms, as if he has fallen asleep over a letter.`),
          Y(`Doctor? Supper.`),
          N(`He does not move. You do not need to touch his wrist, but you do.`),
          sfx('hit'),
          N(`Beside his hand lies a single sheet of cream paper, typed. Three short lines. A signature.`),
          sfx('door'),
          show('margaret', 'c', 'n'),
          N(`Lady Margaret has followed you down the corridor. She stops in the doorway and looks at the body, and then at the note, and for a long moment she looks at nothing at all.`),
          S('margaret', `Then it is over.`),
          N(`She does not ask what happened. She does not ask how.`),
          { cliff: 'margaret' }
        ]
      }
    ],
    vote: voteOf('r3', 'Episode 3 verdict', [
      { id: 'edmund', text: 'Who killed Edmund Blackwood?' },
      { id: 'hale', text: 'Who killed Dr. Hale?' }
    ]),
    watch: {
      pennington: `Swore vengeance. Carried supper. Holds the spare keys.`,
      margaret: `Her first words: "Then it is over." She did not ask how.`,
      vivian: `Says she saw someone carrying a tray into the study.`,
      hale: `Found dead in a room only the Inspector could unlock, beside a typed confession.`,
      dobbs: `Says Lady Margaret brings the Master's tonic every night.`
    },
    teaser: `Next: two graves, one locked door, and the question of whether one killer or two.`
  };

  /* ================= EPISODE 4 ================= */
  const ep4 = {
    n: 4, title: 'Two Graves', logline: 'The last glass, the last lie, and a verdict only you can deliver.',
    recap: [
      `Edmund was poisoned. The evidence pointed at one man.`,
      `That man swore he was framed, and you locked him in the library.`,
      `You carried his supper. You found him dead.`,
      `And Lady Margaret did not ask how.`
    ],
    scenes: [
      {
        id: 'body', bg: 'library', amb: 'clock', mood: 'dread', fx: 'dust',
        steps: [
          slate('The Library · 7:20 PM'),
          N(`Two bodies in one house in two days. Whoever you are dealing with is either very desperate or very patient.`),
          show('margaret', 'cl', 'n'), show('pennington', 'cr', 'w'),
          S('pennington', `Sir. Is he...`, 'w'),
          Y(`Dead, Pennington. Everyone out. Lady Margaret, please wait in the hall.`),
          hide('margaret'), hide('pennington'),
          { menu: { prompt: 'Examine the library', style: 'scene', must: 'Look at the body, the tray and the note.', done: 'I know what I am looking at.', items: [
            { id: 'hbody', icon: '🪑', label: 'Dr. Hale', must: true, steps: [
              N(`The same blue tinge at the lips. The same hand at the chest. A doctor who knew exactly what was happening to him and could not stop it.`),
              Y(`The same poison. The same hand, perhaps.`)] },
            { id: 'tray', icon: '🍵', label: 'The supper tray', must: true, steps: [
              N(`The soup bowl is scraped clean. In the teacup lie greenish dregs. You lift it. The bitter smell is the same as the silver measure in the study.`),
              Y(`He was poisoned the same way as Edmund. With the same tonic.`), clue('teaTray')] },
            { id: 'note', icon: '📄', label: 'The typed note', must: true, steps: [
              N(`"I killed the Master. I cannot bear what I have done. Forgive me. J. Hale."`),
              Y(`"The Master."`),
              N(`Hale called his friend Edmund. Always. Thirty years of "Edmund" in every sentence he spoke to you. He never once said "the Master".`),
              clue('confessionNote')] },
            { id: 'typewriter', icon: '⌨️', label: 'The typewriter', steps: [
              N(`Vivian's machine, on the library desk. Cream stationery from the study drawer lies beside it. Anyone who could reach the study stationery could have fed it in.`)] },
            { id: 'window', icon: '🪟', label: 'The window', steps: [
              N(`Latched from the inside again. The door was locked from the outside, with the only key in your pocket.`),
              Y(`Almost the only key. Pennington mentioned a spare.`)] }
          ] } },
          N(`A confession that tidies up an entire case. You have seen those before. They are very rarely written by the dead.`)
        ]
      },
      {
        id: 'kitchen4', bg: 'kitchen', amb: 'kitchen', mood: 'tense', fx: 'embers',
        steps: [
          slate('The Kitchen · 8:05 PM'),
          show('dobbs', 'c', 'w'),
          S('dobbs', `Is it true? The doctor? Oh, dear God.`, 'sh'),
          { menu: { prompt: `Ask Mrs. Dobbs...`, style: 'talk', must: 'Show her the supper tray details.', done: 'Thank you, Mrs. Dobbs.', items: [
            { id: 'k4_tray', label: 'Show Mrs. Dobbs the teacup.', must: true, steps: [
              { present: { prompt: 'Show Mrs. Dobbs', ok: ['teaTray'], hint: 'Something from the library.', right: [
                S('dobbs', `That's off the doctor's tray. I made the soup and the tea myself. Pennington came for it at half past six and wouldn't let me carry it. Said it wasn't right for a woman to climb the stairs with a tray in this weather.`),
                S('dobbs', `Then he came back down for the sugar bowl, after I'd covered the soup. I turned to the range. That's all.`, 'w'),
                clue('supperTray')],
                wrong: () => [S('dobbs', `That's not the tray, dear.`)] } }] },
            { id: 'k4_food', label: `"Was anything in the soup yourself?"`, steps: [
              S('dobbs', `Onions, a bone and a prayer, dear. Nothing else.`)] }
          ] } },
          hide('dobbs')
        ]
      },
      {
        id: 'cellar4', bg: 'cellar', amb: 'furnace', mood: 'dread', fx: 'embers',
        steps: [
          slate('The Cellar · 8:40 PM'),
          N(`You go down alone. The furnace is banked low, glowing, patient. This is where it all began, with a butler on his knees and a fire full of ledger pages.`),
          sfx('steps'),
          { menu: { prompt: 'Search the furnace', style: 'scene', must: 'Rake through the ash.', done: 'Take the shard and go up.', items: [
            { id: 'ash', icon: '🔥', label: 'The ash', must: true, steps: [
              N(`Under a crust of old cinders, fresh ash. And in it, something that catches the glow: a curved shard of brown glass, half a label still stuck to it.`),
              N(`"...diac Tonic."`),
              Y(`Hale's Cardiac Tonic. The bottle from Edmund's study cabinet, broken and burned where nobody would look twice.`),
              clue('tonicShard'), sfx('stinger')] },
            { id: 'pipes', icon: '🔧', label: 'The pipes', steps: [
              N(`Cold iron and cobwebs. Nobody has been here in a year.`)] }
          ] } },
          N(`Somewhere above you, a door closes softly. A very ordinary sound.`)
        ]
      },
      {
        id: 'vote4', bg: 'drawing', amb: 'fire', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Drawing Room · 9:00 PM'),
          N(`Before you face them, you lay everything out on the table. Two bodies. One poison. A butler's vow, a widow's careful hand, a niece who ran, a cook with a tin of foxglove, and a dead doctor's typed confession.`),
          N(`Two deaths. Maybe one killer. Maybe two. It is time to decide.`),
          { do: () => { G.composure = 3; G.finale = true; G.cleared = {}; } },
          Y(`Detectives, the case is yours. Name whom you believe killed Edmund Blackwood, and whom you believe killed Dr. Hale. Whatever you decide, I will have to prove.`)
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'fire', mood: 'finale', fx: 'dust',
        steps: [
          slate('The Drawing Room · 9:20 PM'),
          N(`Four people in a firelit room, and a question that has been waiting for them all night.`),
          show('vivian', 'l', 'w'), show('pennington', 'cl', 'n'), show('margaret', 'cr', 'n'), show('dobbs', 'r', 'w'),
          Y(`Two people have died in this house. I will tell you how.`),
          { accuse: { qid: 'hale', vote: { key: 'f_hale', title: 'The Reckoning: Dr. Hale', qs: [{ id: 'hale', text: 'Who killed Dr. Hale?' }], options: SUSPECT_OPTIONS.filter(o => o.id !== 'hale') },
            wrong: {
              margaret: [S('margaret', `I loved my husband, Inspector. I was in the drawing room. Ask anyone.`, 'a'), Y(`Lady Margaret could not have laid hands on the tray. Pennington carried it. That is not the answer.`)],
              vivian: [S('vivian', `I was with you all afternoon! You were beside me!`, 'a'), Y(`You were in my sight from noon until the body was found. That is not the answer.`)],
              dobbs: [S('dobbs', `Me? I'd sooner burn the soup than poison a man with it!`, 'a'), Y(`Mrs. Dobbs made the soup, but she never carried the tray. That is not the answer.`)]
            },
            right: [
              hide('margaret'), hide('vivian'), hide('dobbs'), show('pennington', 'c', 'w'),
              Y(`Pennington. Look at me.`),
              S('pennington', `Sir?`, 'w'),
              { present: { prompt: 'Why would anyone kill Dr. Hale?', ok: ['penOath', 'penSaw', 'thursdays'], cost: 1, hint: `What did Pennington believe about the doctor?`,
                right: [
                  Y(`You burned the ledger to protect Edmund. You saw Dr. Hale enter the study. And you swore you would see justice done, whatever it cost.`),
                  Y(`You believed the doctor had murdered your Master, and you could not wait for the law.`),
                  S('pennington', `...`, 'w')],
                wrong: () => [S('pennington', `I do not follow, sir.`)] } },
              { present: { prompt: 'How was Dr. Hale poisoned?', ok: ['teaTray', 'tonicShard', 'supperTray'], cost: 1, hint: `The tray, who carried it, or what was burned.`,
                right: [
                  Y(`You took the Master's tonic from the study cabinet, the same tonic that killed him. You put it in the doctor's soup. You carried the tray yourself. You went back for the sugar so you could do it alone.`),
                  Y(`And you broke the bottle and put it in the furnace, where you had burned the pages the night before.`),
                  S('pennington', `Sir. I...`, 'sh')],
                wrong: () => [S('pennington', `That means nothing, sir.`)] } },
              { present: { prompt: 'Who wrote the confession?', ok: ['confessionNote'], cost: 1, hint: `Dr. Hale never called his friend by that name.`,
                right: [
                  Y(`"I killed the Master." Dr. Hale never once called Edmund that. Thirty years, and it was always "Edmund". Only one person in this house speaks that way.`),
                  N(`The silence is complete. Then Pennington straightens, slowly, and the stiffness goes out of him, and something old and tired comes in.`),
                  S('pennington', `Yes. It was I.`, 'n'),
                  S('pennington', `He was a murderer, sir. The Master was dead and the law was snowed in, and the man who killed him sat in the library with his hands folded. I could not bear it. I did what the law was too slow to do.`),
                  S('pennington', `I put the tonic in his soup. I typed what I thought he ought to have said.`, 'w'),
                  Y(`Pennington. Dr. Hale did not kill Edmund Blackwood.`),
                  S('pennington', `...Sir?`, 'sh'),
                  Y(`He was framed. The scrap in the grate was laid to be found. The signatures were forged by someone else. And the Master's own medicine killed him, brought to him by someone else.`),
                  N(`Pennington's mouth opens and nothing comes out of it. For thirty-one years he held the whole house together, and in a single sentence you have taken the one thing he thought he had left: that he did it for justice.`),
                  S('pennington', `Then I have...`, 'sh'),
                  sfx('hit'), flash('#ffffff')],
                wrong: () => [S('pennington', `I wrote nothing, sir.`)] } }
            ] } },
          hide('pennington'),
          show('margaret', 'cr', 'n'), show('vivian', 'l', 'w'), show('dobbs', 'r', 'w'),
          Y(`And now Edmund.`),
          { accuse: { qid: 'edmund', vote: { key: 'f_edmund', title: 'The Reckoning: Edmund Blackwood', qs: [{ id: 'edmund', text: 'Who killed Edmund Blackwood?' }], options: SUSPECT_OPTIONS.filter(o => o.id !== 'hale') },
            wrong: {
              pennington: [S('pennington', `I served the Master for thirty-one years. I would not have harmed a hair of his head.`, 'a'), Y(`Pennington killed in revenge, and for the wrong man. He had no reason to hurt Edmund. That is not the answer.`)],
              vivian: [S('vivian', `Uncle raised me.`, 'w'), Y(`The vial in your coat was put there for me to find. A poisoner does not hand over her own proof. That is not the answer.`)],
              dobbs: [S('dobbs', `The foxglove is for my ankles!`, 'a'), Y(`Mrs. Dobbs washes the measure every morning. She never carried the tonic. That is not the answer.`)]
            },
            right: [
              hide('vivian'), hide('dobbs'), show('margaret', 'c', 'n'),
              S('margaret', `This is an outrage, Inspector.`, 'a'),
              { present: { prompt: 'Why did Edmund have to die?', ok: ['handwriting', 'letter', 'thursdays'], cost: 1, hint: `Who actually forged those signatures?`,
                right: [
                  Y(`Edmund meant to take the thefts to the magistrate on Monday. He believed the doctor guilty, because the books had been arranged to say so. But every forged "E" has a looped tail.`),
                  Y(`The same loop as your household accounts, Lady Margaret.`),
                  S('margaret', `Anyone could copy a hand.`, 'a')],
                wrong: () => [S('margaret', `You have nothing, Inspector.`)] } },
              { present: { prompt: 'How was Edmund poisoned?', ok: ['medicineGlass', 'tonicRitual', 'body', 'teaTray'], cost: 1, hint: `Not the brandy. Something he took every night.`,
                right: [
                  Y(`Not the brandy. The tonic. A measure every night at half past nine, poured by a loving wife, and tonight it was far stronger than any doctor would ever have prescribed.`),
                  Y(`The same bitter smell in the silver measure, and in the doctor's teacup.`),
                  S('margaret', `A wife may carry her husband's medicine.`, 'w')],
                wrong: () => [S('margaret', `That proves nothing.`)] } },
              { present: { prompt: 'She said she was alone. Break it.', ok: ['tonicRitual', 'trayFigure', 'margaretSlip', 'penBag', 'haleLeft'], cost: 1, hint: `Where she said she was, and what she said she knew.`,
                right: [
                  Y(`You said you were alone in this room. But Edmund was alive when the doctor left at twenty past nine. At half past, a woman in dark clothes carried a tray into the study. And you knew the word "magistrate", which was written only in a drawer you never opened.`),
                  Y(`And on the night, you carried the doctor's bag to the cloakroom yourself, so you could take what you needed from it, and plant it later where it would do the most harm.`),
                  N(`Lady Margaret does not shout. She does not weep. She sits down very slowly in Edmund's chair, folds her hands, and looks at the fire.`),
                  S('margaret', `Thirty years I sat across the breakfast table from a man who counted the coal.`, 'n'),
                  S('margaret', `He would have thrown me out with the clothes I stood in. I had debts, Inspector, such debts. I took only what I needed. Julian signed whatever was put in front of him. It was so easy.`),
                  S('margaret', `And then Edmund found out. And he was going to put it all on Julian, and Julian would have stood in the dock and told them about my handwriting.`, 'a'),
                  S('margaret', `So I carried his tonic up, as I always did. And I stayed until he was quiet.`),
                  sfx('hit'), flash('#ffffff')],
                wrong: () => [S('margaret', `You cannot prove a thing.`)] } }
            ] } },
          { do: () => { G.finale = false; } },
          show('vivian', 'l', 'sh'),
          S('vivian', `Uncle...`, 'w'),
          N(`Nobody moves. Pennington is crying silently in the doorway, upright, the way a servant weeps. Vivian has taken Mrs. Dobbs's hand.`)
        ]
      },
      {
        id: 'coda', bg: 'exterior', amb: 'wind', mood: 'dread', fx: 'snow',
        steps: [
          slate('Blackwood Manor · 2:10 PM'),
          N(`By afternoon the plough has cut a black trench through the drifts, and a police trap crawls up the drive.`),
          show('margaret', 'c', 'n'),
          N(`Lady Blackwood walks out between two constables with her chin up, her gloves on, and her pearls exactly where they belong.`),
          S('margaret', `You were very thorough, Inspector.`),
          S('margaret', `But you don't believe I did it all alone, do you? A woman does not owe that much money to a bank.`, 's'),
          Y(`Who did you owe?`),
          S('margaret', `Ask Mr. Crane who held the other end of the rope. Ask him why Edmund's letter was addressed to him, and not to the magistrate.`, 'a'),
          N(`She lets the constable help her into the trap, as graciously as if it were a carriage to the opera.`),
          N(`You stand in the cold with a murderer's last words in your head. Mr. Crane. The solicitor. The one man Edmund trusted with the truth.`),
          N(`Down the long white drive, a second carriage is approaching, slowly, out of the thaw.`),
          { cliff: 'margaret' }
        ]
      }
    ],
    watch: {
      pennington: `Killed Dr. Hale, believing him guilty. Devastated.`,
      margaret: `Poisoned her husband. Hints at a creditor: "Mr. Crane".`,
      vivian: `Cleared. Framed.`,
      hale: `Innocent of everything but a signature he never read. Murdered.`,
      dobbs: `Cleared. Grieving.`
    },
    teaser: `Season Two: Mr. Crane is coming up the drive. And Edmund's letter was never meant for the magistrate.`,
    last: true
  };

  const VOICES = { nar: [10, 0.95, 1], you: [10, 0.95, 1], pennington: [9, 0.9, 1], hale: [6, 0.93, 1], margaret: [2, 0.88, 1], vivian: [7, 1.06, 1], dobbs: [8, 0.95, 1], edmund: [5, 0.88, 1] };
  const characters = {};
  Object.keys(NAMES).forEach(id => { characters[id] = { name: NAMES[id], voice: VOICES[id] || VOICES.nar }; });
  characters.nar = { name: '', voice: VOICES.nar };
  const episodes = [ep1, ep2, ep3, ep4];
  CASES.blackwood = {
    id: 'blackwood', title: 'The Blackwood Files', names: NAMES, suspects: SUSPECTS, suspectOptions: SUSPECT_OPTIONS, clues: CLUES,
    solution: SOLUTION, episodes, characters, cast: SUSPECTS,
    scoreRounds: [['r1', 'edmund', 'Ep 1'], ['r2', 'edmund', 'Ep 2'], ['r3', 'edmund', 'Ep 3 · Edmund'], ['r3', 'hale', 'Ep 3 · Hale'], ['f_edmund#1', 'edmund', 'Final · Edmund'], ['f_hale#1', 'hale', 'Final · Hale']],
    truth: n => `Edmund Blackwood was killed by <b>${n[SOLUTION.edmund]}</b>. Dr. Hale was killed by <b>${n[SOLUTION.hale]}</b>.`,
    endCard: 'SEASON ONE · THE END?', completeLabel: 'Season One complete'
  };
  return { NAMES, SUSPECTS, SUSPECT_OPTIONS, CLUES, SOLUTION, episodes };
})();

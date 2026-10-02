/* Silver Blaze. Retold from Arthur Conan Doyle's 1892 story (public domain). Spoilers inside. */
(() => {
  const { N, S, Y, show, hide, clue, sfx, slate, flag, flash, shake, opt } = KIT;

  const CLUES = {
    mutton: { icon: '🍛', name: 'The curried mutton', type: 'Evidence', text: `The stable boy's supper dish, still smelling of curry. Under the spice, a bitter grit: powdered opium. Curry is one of the few dishes that would hide it.` },
    cravat: { icon: '🧣', name: `Simpson's cravat`, type: 'Evidence', text: `A bright silk cravat, found clenched in the dead trainer's hand. The maid knows it: it belongs to Mr. Fitzroy Simpson.` },
    knife: { icon: '🔪', name: 'A tiny, sharp knife', type: 'Evidence', text: `Gripped in Straker's right hand: a slender, razor-keen blade no longer than a finger. A surgeon's cataract knife, not a weapon for a brawl.` },
    bill: { icon: '🧾', name: `A milliner's bill`, type: 'Evidence', text: `In Straker's pocket: a London bill for a twenty-two guinea dress, made out to a "Mr. Derbyshire". A trainer's wage does not run to that.` },
    wound: { icon: '🩸', name: 'The wound on the head', type: 'Evidence', text: `Straker's skull was crushed by a heavy blow, and there is a long clean slash across his thigh. The two injuries do not look as though one hand dealt both.` },
    tracks: { icon: '🐾', name: 'Hoofprints in the hollow', type: 'Evidence', text: `Deep hoofprints churned in the mud of the hollow where the body lay, trampled around the spot where Straker fell.` },
    matches: { icon: '🔥', name: 'A spent vesta', type: 'Evidence', text: `A wax match, half-burned and pressed into the mud of the hollow. Someone struck a light there and the dark took it.` },
    sheep: { icon: '🐑', name: 'Three lame sheep', type: 'Evidence', text: `The shepherd's flock at King's Pyland has three lame sheep. Each has a neat, tiny nick in the tendon. Somebody has been practising.` },
    dog: { icon: '🐕', name: 'The dog that did not bark', type: 'Testimony', text: `A watchdog sleeps in the stable yard. It did not bark on the night the horse was taken. A stranger would have woken the whole yard.` },
    supper: { icon: '🍽️', name: `Why curry that night?`, type: 'Testimony', text: `Edith Baxter: the stable lad's supper was curried mutton, and that was Straker's own suggestion. The household never cooks curry.` },
    simpsonTale: { icon: '🗣️', name: `Simpson's account`, type: 'Testimony', text: `Simpson admits he crept up to the stables to learn what he could for his betting. He met the maid and then Straker, who tore his cravat off in a scuffle at the gate. He ran, and never went near the moor.` },
    mrsStraker: { icon: '👩', name: `Mrs. Straker's dress`, type: 'Testimony', text: `Mrs. Straker has no idea who Derbyshire is, or why her husband carried a bill for a dress. Her husband was in debt.` },
    ned: { icon: '😴', name: `Ned's sleep`, type: 'Testimony', text: `The stable boy Ned Hunter slept through everything, deeply and heavily, from the moment he finished his supper.` },
    bets: { icon: '🎟️', name: `Straker's bets`, type: 'Testimony', text: `Colonel Ross lets slip that Straker ran up debts betting on racing. He could profit if a favourite failed to run.` },
    mapleton: { icon: '🐴', name: 'A bay with a white face', type: 'Testimony', text: `At the neighbouring stable at Mapleton, owned by Silas Brown, stands a bay colt with a white blaze on its face. The colour looks almost too neat.` },
    ross: { icon: '🧐', name: `Colonel Ross's confidence`, type: 'Testimony', text: `Colonel Ross is sure the vagabond Simpson did it. He is not the sort of man to change his mind.` }
  };

  const ep1 = {
    n: 1, title: 'The Missing Favourite', logline: `A champion racehorse gone. A trainer dead on the moor. A stranger in a cell, and a dog that did nothing.`,
    recap: [],
    scenes: [
      {
        id: 'train', bg: 'train', amb: 'room', mood: 'calm', fx: 'dust',
        steps: [
          slate('The Plymouth express · Tuesday'),
          N(`The carriage rocks through the dark. Dr. Watson folds the newspaper and watches you across the compartment, where you sit with your eyes half shut and your pipe cold.`),
          show('watson', 'l', 'n'),
          S('watson', `Holmes. A telegram from Colonel Ross, owner of Silver Blaze, favourite for the Wessex Cup. The horse is gone from its stable at King's Pyland, and the trainer, John Straker, was found dead on the moor.`),
          S('watson', `The police have a man. A stranger named Simpson, found wandering near the stables.`),
          Y(`Seen from London, Watson, a case is a map. Seen from Devon, it is a puzzle with a smell.`),
          S('watson', `Do you have a theory?`),
          { choice: { prompt: 'What do you tell Watson?', opts: [
            { t: `"None yet. A theory before the facts bends the facts to fit it."`, steps: [flag('cautious'), S('watson', `Spoken like a man who has been fooled by his own cleverness before.`)] },
            { t: `"Only that the obvious man is rarely the right one."`, steps: [flag('sceptic'), S('watson', `Then you already doubt this Simpson.`)] },
            { t: `"Three things are certain: a horse, a man, and a dark night. Everything else is guesswork."`, steps: [flag('plain'), S('watson', `Three facts and a night. That's your whole theory?`)] }
          ] } },
          N(`Beyond the glass, the moor rolls by under a pale moon, miles of heather with nothing living in it.`),
          sfx('door')
        ]
      },
      {
        id: 'stable', bg: 'stable', amb: 'wind', mood: 'tense', fx: 'dust',
        steps: [
          slate('King\'s Pyland stables · Wednesday morning'),
          show('gregory', 'l', 'n'), show('ross', 'r', 'a'),
          S('gregory', `Mr. Holmes. Inspector Gregory. We are glad of you. We have the man who did it, and no way to prove why.`),
          S('ross', `He is a villain, sir. He drugged the lad, took my horse, and killed poor Straker when he was caught.`),
          Y(`Let us see the ground before we settle on villains.`),
          hide('ross'), hide('gregory'),
          { menu: { prompt: 'Examine the stable', style: 'scene', must: 'Look at the supper dish and ask about the dog before you go.', done: `I've seen enough here.`, items: [
            { id: 'dish', icon: '🍛', label: 'The supper dish', must: true, steps: [
              N(`Ned Hunter's dish stands on a shelf where the maid left it. A thin crust of curry clings to the rim.`),
              Y(`Watson, smell this.`),
              S('watson', `Curry. And something bitter beneath it. It makes my tongue numb.`),
              Y(`Powdered opium, and it would take a strong spice to hide it. Remember that.`),
              clue('mutton')
            ] },
            { id: 'dog', icon: '🐕', label: 'The watchdog', must: true, steps: [
              N(`A large, sleepy dog is chained near the stable door. He wags his tail at everyone in the yard.`),
              S('gregory', `He never made a sound that night. Ned was drugged, but the dog should have raised the roof.`),
              Y(`That is what interests me. The dog did nothing in the night-time.`),
              S('gregory', `But that was the dog doing nothing, Mr. Holmes.`),
              Y(`That was the curious incident.`),
              clue('dog')
            ] },
            { id: 'ned', icon: '😴', label: 'Ned Hunter', steps: [
              show('ned', 'c', 'w'),
              S('ned', `I ate my supper, sir, and I remember nothing after. I woke up with a head like a drum and the horse gone.`),
              Y(`Did anyone else eat the curry?`),
              S('ned', `No, sir. The Strakers had something else at the house. Mr. Straker said I should have the mutton and a bit of spice.`, 'w'),
              hide('ned'), clue('ned')
            ] },
            { id: 'sheep', icon: '🐑', label: 'The shepherd', steps: [
              N(`The shepherd, leaning on his crook, shakes his head at your question.`),
              S('gregory', `He says three of his sheep have gone lame in the past fortnight. Nothing to do with the case, I'm afraid.`),
              Y(`Three lame sheep. Interesting.`),
              clue('sheep')
            ] }
          ] } },
          show('gregory', 'c', 'n'),
          S('gregory', `Mr. Holmes, will you come to the moor? We have the place where Straker fell.`)
        ]
      },
      {
        id: 'moor', bg: 'moor', amb: 'wind', mood: 'dread', fx: 'dust',
        steps: [
          slate('The hollow · the moor · noon'),
          N(`A mile from the stables the ground drops into a ragged hollow. A dark stain marks the earth, trampled by dozens of boots.`),
          show('gregory', 'l', 'n'),
          S('gregory', `He lay here, head smashed in. A heavy stick, we think. And his dead hand held this.`),
          { menu: { prompt: 'Examine the hollow', style: 'scene', must: 'Find the body, the pockets and the ground.', done: `That's the whole of it.`, items: [
            { id: 'body', icon: '🪦', label: 'The body\'s place', must: true, steps: [
              N(`There is a crushed heather where the trainer lay. The head wound is brutal, but there is a long clean slash across his thigh as well.`),
              Y(`A stick does not slice like a razor, Inspector.`),
              clue('wound')
            ] },
            { id: 'pockets', icon: '🧥', label: `Straker's pockets`, must: true, steps: [
              N(`Gregory hands over the dead man's belongings: a pipe, some coins, a tiny razor-keen knife, and a folded paper.`),
              clue('knife'),
              Y(`A cataract knife. A surgeon's instrument, not a street fighter's.`),
              S('gregory', `The bill is for a London milliner. Twenty-two guineas, made out to a Mr. Derbyshire.`),
              clue('bill')
            ] },
            { id: 'ground', icon: '🐾', label: 'The ground', must: true, steps: [
              N(`You lower yourself to the mud with your lens.`),
              N(`Hoofprints churned the earth, deep and plunging, as if a heavy animal had reared and struck. Beside them lies a half-burned match.`),
              clue('tracks'), clue('matches')
            ] },
            { id: 'cravat', icon: '🧣', label: 'The cravat', steps: [
              N(`Gregory shows you a bright silk cravat, taken from the dead man's grip.`),
              S('gregory', `The maid, Edith Baxter, swears it is Simpson's. We think he and Straker fought, and he lost it in the struggle.`),
              clue('cravat')
            ] }
          ] } },
          Y(`Inspector, who lives at the nearest stable?`),
          S('gregory', `Mapleton is a mile east. Silas Brown trains there. A rival of Colonel Ross's, but a gentleman.`),
          Y(`I shall call on Mr. Brown presently. First, let us meet the prisoner.`)
        ]
      },
      {
        id: 'cell', bg: 'cell', amb: 'none', mood: 'tense', fx: 'dust',
        steps: [
          slate('The Tavistock lock-up · afternoon'),
          show('simpson', 'c', 'a'),
          S('simpson', `Is this the great Mr. Holmes? Then you will believe an honest man when you hear one.`),
          Y(`I believe facts, Mr. Simpson. Tell me where you were on Monday night.`),
          S('simpson', `Near the stables, I admit it. I am a betting man. I wanted to know how the horse was, so I could lay my money. There is no crime in it.`, 'w'),
          { menu: { prompt: 'Question Mr. Simpson', style: 'talk', must: 'Ask about the maid and the cravat.', done: `That's enough for now.`, items: [
            { id: 's_maid', label: `"You spoke to the maid."`, must: true, steps: [
              S('simpson', `Edith Baxter, with the stable lad's supper. I asked about the horse. She ran back to the house like a rabbit.`),
              Y(`What did she carry?`),
              S('simpson', `A dish with a cover. Smelled of spice. I did not touch it.`, 'w')
            ] },
            { id: 's_cravat', label: `"Your cravat was in a dead man's hand."`, must: true, steps: [
              S('simpson', `Is that where it went? Straker caught me by the gate at ten o'clock, tore it from my neck, and told me to get off the grounds. I ran. I never saw him again.`, 'a'),
              clue('simpsonTale')
            ] },
            { id: 's_bets', label: `"Who gains if the horse fails to run?"`, steps: [
              S('simpson', `Anyone who bets against it. I would have wagered on Silver Blaze all day. It is Straker who had the debts, not I.`, 'a')
            ] }
          ] } },
          Y(`Thank you. You'll be out soon, I think.`),
          hide('simpson')
        ]
      },
      {
        id: 'mrsstraker', bg: 'drawing', amb: 'clock', mood: 'calm', fx: 'dust',
        steps: [
          slate('The trainer\'s cottage · evening'),
          show('mrsstraker', 'c', 'sh'),
          S('mrsstraker', `He left after supper to look at the horse. I never saw him again.`),
          { menu: { prompt: 'Ask Mrs. Straker...', style: 'talk', must: 'Ask about her husband\'s money.', done: `I have what I need.`, items: [
            { id: 'ms_money', label: `"Were you short of money?"`, must: true, steps: [
              S('mrsstraker', `We lived simply. John kept the accounts. I never asked.`),
              Y(`He carried a bill for a dress made out to Mr. Derbyshire.`),
              S('mrsstraker', `Derbyshire? I know no one of that name. And I never owned a dress like that, Mr. Holmes.`, 's'),
              clue('mrsStraker')
            ] },
            { id: 'ms_supper', label: `"Who ordered the curry?"`, steps: [
              S('mrsstraker', `John did. He said the boy deserved something warm.`),
              clue('supper')
            ] }
          ] } },
          show('ross', 'r', 'a'),
          S('ross', `It's Simpson, Mr. Holmes. It must be Simpson. I shall see him hanged.`),
          Y(`Colonel, nothing is more dangerous than a certainty that arrives before the evidence.`),
          clue('ross'),
          hide('ross'), hide('mrsstraker')
        ]
      },
      {
        id: 'mapleton', bg: 'stable', amb: 'wind', mood: 'dread', fx: 'dust',
        steps: [
          slate('Mapleton stables · dusk'),
          N(`The Mapleton yard is tidy and quiet. A tall man in a cap waits by the door, his face as unreadable as a shut ledger.`),
          show('silas', 'c', 'n'),
          S('silas', `Mr. Holmes, is it? I'm Silas Brown. I hear you've come about Straker's poor business.`),
          Y(`I've come about the horse, Mr. Brown.`),
          S('silas', `You'll find him gone, as everyone knows. I have my own colt to train for the Cup.`, 'a'),
          N(`Behind him in a loose-box stands a bay colt with a white blaze on its forehead. Too clean, too neat, like paint on a wall.`),
          clue('mapleton'),
          Y(`A fine animal.`),
          S('silas', `Desborough. Out of Ladybird. You've no business with him, sir.`),
          N(`He steps squarely in front of the loose-box, and the yard goes silent.`),
          { cliff: 'silas' }
        ]
      }
    ],
    vote: { key: 'r1', title: 'Episode 1 verdict', qs: [
      { id: 'straker', text: `Who killed John Straker?`, options: [opt('simpson'), opt('silas'), opt('mrsstraker'), opt('ned'), { id: 'blaze', label: 'Silver Blaze (the horse)' }] },
      { id: 'horse', text: `Who led Silver Blaze out of the stable?`, options: [opt('simpson'), opt('silas'), opt('mrsstraker'), opt('ned'), { id: 'straker', label: 'John Straker himself' }] }
    ] },
    watch: {
      simpson: `Admits sneaking about for the betting. Says Straker tore his cravat.`,
      silas: `A rival trainer. A bay colt with a white blaze, and a hand on the door.`,
      mrsstraker: `Knows nothing of Derbyshire or the dress.`,
      ned: `Drugged with opium in a curry. Remembers nothing.`,
      ross: `Wants Simpson hanged. Does not want to be corrected.`
    },
    teaser: `Next: what Holmes does with a sponge, a winning horse, and a very important night in Devon.`
  };

  const ep2 = {
    n: 2, last: true, title: 'The Curious Incident', logline: `A sponge, a horse, and the one clue that was never there.`,
    recap: [`A trainer, dead on the moor, a surgeon's knife in his hand.`, `A stable boy drugged with opium in a curry.`, `A dog that did not bark.`, `And in Mapleton, a bay colt with a suspiciously neat white blaze.`],
    scenes: [
      {
        id: 'brown', bg: 'stable', amb: 'wind', mood: 'tense', fx: 'dust',
        steps: [
          slate('Mapleton stables · the same dusk'),
          show('silas', 'l', 'a'), show('gregory', 'r', 'n'),
          S('silas', `I'll thank you to leave my yard, Mr. Holmes.`),
          Y(`I shall. In a moment. Inspector, would you mind if I borrowed a sponge and a bucket from Mr. Brown's wash-room?`),
          S('silas', `What business have you with my sponge, sir?`, 'w'),
          { present: { prompt: 'Prove this colt is not Desborough', ok: ['mapleton', 'tracks'], cost: 1, hint: `Something that would never wash off a real horse. Or a horse that never was dyed.`,
            right: [
              Y(`White hair on a bay colt is easy, if you're quick, with a pot of dye and the right hour. Watch.`),
              N(`You wring out the sponge and draw it down the colt's blaze. The white runs off in grey streaks. Beneath it, the horse's face is dark.`),
              S('gregory', `By Heaven. The brown's face is the same as the photograph of Silver Blaze that hangs in the office.`),
              S('silas', `I was only keeping him safe!`, 'a'),
              Y(`You were keeping him from the Cup, Mr. Brown. You would have run him under your own name and watched your own colt win.`),
              clue('mapleton')
            ],
            wrong: () => [S('silas', `You've nothing to show, sir.`)] } },
          S('silas', `The horse found its own way to my yard at dawn. I did not take him, I swear it. I only hid him, and painted him, because I wanted him to lose.`, 'sh'),
          Y(`Who brought him out of his box, Mr. Brown?`),
          S('silas', `No one that I saw. He came down from the moor by himself, with a clot of blood on his coat.`, 'w'),
          hide('silas'), hide('gregory')
        ]
      },
      {
        id: 'knifework', bg: 'moor', amb: 'wind', mood: 'dread', fx: 'dust',
        steps: [
          slate('The moor · twilight'),
          show('watson', 'l', 'n'),
          S('watson', `Holmes, the dog, the curry, the knife, the three sheep. I can see they tie together, but I cannot see how.`),
          Y(`Take them in order, Watson.`),
          { present: { prompt: 'Who was the stable dog used to?', ok: ['dog', 'supper', 'ned'], cost: 1, hint: `The dog did not bark. What does that say about the person who came?`,
            right: [
              Y(`The dog did not bark, so the visitor was no stranger. It was someone who walked through the yard every day.`),
              Y(`And the curry. Opium on a stable boy's plate. It's a drug that needs a spice to hide it, and a man who knows how the household cooks.`),
              S('watson', `Someone who lived there.`),
              Y(`Someone who could order the curry himself.`, 'a')
            ],
            wrong: () => [S('watson', `You're hinting at something. I'm lost.`)] } },
          { present: { prompt: 'Why did John Straker carry a surgeon\'s knife?', ok: ['knife', 'sheep', 'bill', 'bets'], cost: 1, hint: `He had debts and three lame sheep. What was he planning for the horse?`,
            right: [
              Y(`Straker was deep in debt, as that bill and those bets prove. He had a plan: lame the favourite so that it could not run.`),
              Y(`A cataract knife makes a tiny cut in a tendon, almost impossible to detect. He practised on the sheep until his hand was sure.`),
              S('watson', `Good Lord. The trainer himself.`),
              Y(`He drugged the boy, led the horse out, and took it to the hollow, knowing that no dog would raise the alarm.`),
              Y(`And there, in the dark, with a match for light, he raised the knife.`, 'a')
            ],
            wrong: () => [S('watson', `But why a knife, Holmes?`)] } },
          hide('watson')
        ]
      },
      {
        id: 'finale', bg: 'drawing', amb: 'fire', mood: 'finale', fx: 'dust',
        steps: [
          slate('The Tavistock inn · the same night'),
          N(`The whole company has been gathered in the long room of the inn.`),
          show('ross', 'l', 'a'), show('gregory', 'cl', 'n'), show('simpson', 'cr', 'w'), show('mrsstraker', 'r', 'sh'),
          Y(`Colonel Ross, Inspector, you have all made up your minds. Tonight you will unmake them. Who killed John Straker?`),
          { accuse: { qid: 'straker', vote: { key: 'f_straker', title: 'The Reckoning: John Straker', qs: [{ id: 'straker', text: `Who killed John Straker?` }], options: [opt('simpson'), opt('silas'), opt('mrsstraker'), opt('ned'), { id: 'blaze', label: 'Silver Blaze (the horse)' }] },
            wrong: {
              simpson: [S('simpson', `Thank you, Mr. Holmes! I told them I didn't touch him!`, 'a'), Y(`The cravat is explained and the opium never touched your hands. You did not kill him.`)],
              silas: [S('silas', `I hid a horse, not a man! I'll answer for my paint pot, not for a murder.`, 'a'), Y(`Brown was not in the hollow. He only found the horse after the man was dead.`)],
              mrsstraker: [S('mrsstraker', `My husband! I loved him, Mr. Holmes!`, 'a'), Y(`The blow that killed him was no woman's work. Think again.`)],
              ned: [S('ross', `The boy was asleep all night, Holmes!`, 'a'), Y(`Ned slept like the dead. Think again.`)]
            },
            right: [
              hide('simpson'), hide('mrsstraker'), hide('gregory'), show('ross', 'c', 'sh'),
              Y(`Colonel, you are going to find this hard to believe.`),
              S('ross', `Who, Mr. Holmes? Say the name!`),
              { present: { prompt: 'Explain the death of John Straker', ok: ['tracks', 'wound', 'knife', 'matches'], cost: 1, hint: `A heavy animal. A tiny knife. A man alone in the dark.`,
                right: [
                  Y(`Straker took the horse to the hollow, intending to lame it with that knife. In the dark he struck a match, and the horse took fright.`),
                  Y(`Silver Blaze reared. He is a gentle horse, Colonel, but he knows his master from a stranger. The hooves came down on Straker's head, and in the struggle the knife slashed Straker's own thigh.`),
                  N(`The room is utterly still. The Colonel opens his mouth, closes it, and sits down in a chair as though his legs had been cut from under him.`),
                  S('ross', `A horse. A horse killed him.`, 'sh'),
                  Y(`He killed his master. And then, in terror, he ran across the moor to Mapleton, where Mr. Brown found him.`)
                ],
                wrong: () => [S('ross', `Say that again, Holmes. A horse?`)] } }
            ] } },
          N(`The Wessex Cup is run a week later. The favourite, with his white blaze restored, wins by three lengths. Colonel Ross is cheered in the stand, and the Colonel, red as his coat, never once meets your eye.`),
          { cliff: 'holmes' }
        ]
      }
    ],
    watch: {
      simpson: `Free. His only crime was a betting man's curiosity.`,
      silas: `Hid the horse and dyed its face. Will answer for that.`,
      mrsstraker: `A widow with questions about a man she never knew.`,
      ned: `Recovered, and returned to his horses.`,
      ross: `Humbled. Tells his friends it was all his idea.`
    },
    teaser: `The most important clue in Silver Blaze was a dog that stayed quiet.`
  };

  KIT.build({
    id: 'silverblaze', title: 'Silver Blaze',
    cast: ['watson', 'gregory', 'ross', 'simpson', 'silas', 'ned', 'mrsstraker'],
    suspects: ['simpson', 'silas', 'mrsstraker', 'ned', 'ross'],
    clues: CLUES, solution: { straker: 'blaze', horse: 'straker' }, episodes: [ep1, ep2],
    scoreRounds: [['r1', 'straker', 'Ep 1 · Killer'], ['r1', 'horse', 'Ep 1 · Horse'], ['f_straker#1', 'straker', 'Final']],
    truth: () => `John Straker was killed by <b>Silver Blaze, the horse</b>, as Straker tried to lame him. And it was <b>John Straker himself</b> who led the horse out of the stable.`,
    endCard: 'CASE CLOSED', completeLabel: 'Case solved'
  });
})();

import React, { useState, useEffect, useRef } from 'react';
import { 
  playTone, 
  playLaser, 
  playExplosion, 
  playLaunch, 
  playScoreSound, 
  playDeathSound, 
  playBeep, 
  playSuccess, 
  playThemeMusic, 
  stopThemeMusic 
} from './audio';

// Room database detailing all descriptions, graphics, exits, and visual actions
const ROOMS = {
  // --- ACT 1: THE ARCADA ---
  closet: {
    name: 'Broom Closet',
    image: '/images/arcada.jpg',
    description: 'You are in a dark broom closet. Mops and dusty shelves line the walls. To the west is the main corridor. You are temporarily safe here.',
    exits: { west: 'hallway_west' },
    actions: ['Look Shelf', 'Look Bucket', 'Go West'],
  },
  hallway_west: {
    name: 'West Hallway',
    image: '/images/arcada.jpg',
    description: 'A metallic corridor on the Arcada. Warning alarms are flashing red. An elevator goes south, the hallway continues east, and the broom closet is to the east.',
    exits: { east: 'hallway_east', south: 'airlock_room', west: 'closet' },
    actions: ['Go East', 'Go South', 'Go West'],
  },
  hallway_east: {
    name: 'East Hallway',
    image: '/images/arcada.jpg',
    description: 'The corridor is filled with haze. A dead crew member lies sprawled on the metal deck. A computer door leads north into the Data Archive.',
    exits: { west: 'hallway_west', north: 'archive' },
    actions: ['Look Body', 'Search Body', 'Go North', 'Go West'],
  },
  archive: {
    name: 'Data Archive',
    image: '/images/arcada.jpg',
    description: 'Computer terminals line this room. A wounded scientist lies on the floor gasping for air. A door leads south back to the hallway.',
    exits: { south: 'hallway_east' },
    actions: ['Talk Scientist', 'Look Console', 'Get Cartridge', 'Go South'],
  },
  airlock_room: {
    name: 'Spacesuit Chamber',
    image: '/images/arcada.jpg',
    description: 'This room houses the main airlock and safety lockers. To the north is the hallway, and south is the Escape Pod Bay.',
    exits: { north: 'hallway_west', south: 'pod_bay' },
    actions: ['Open Closet', 'Get Suit', 'Get Translator', 'Go South', 'Go North'],
  },
  pod_bay: {
    name: 'Escape Pod Bay',
    image: '/images/arcada.jpg',
    description: 'A heavy pressure door locks access to the Escape Pod. A keycard reader console sits beside the hatch.',
    exits: { north: 'airlock_room' },
    actions: ['Use Keycard', 'Enter Pod', 'Launch Pod', 'Go North'],
  },

  // --- ACT 2: PLANET KERONA ---
  crash_site: {
    name: 'Kerona Crash Site',
    image: '/images/kerona.jpg',
    description: 'Your escape pod has crash-landed and is now a smoking wreckage. Red sands stretch to the horizon. A canyon path leads east.',
    exits: { east: 'desert_path' },
    actions: ['Search Pod', 'Open Kit', 'Get Glass', 'Go East'],
  },
  desert_path: {
    name: 'Desert Canyon',
    image: '/images/kerona.jpg',
    description: 'A rocky desert path. High above, a massive boulder sits precariously on the canyon rim. To the east are dark caves.',
    exits: { west: 'crash_site', east: 'caves' },
    actions: ['Look Boulder', 'Push Boulder', 'Go East', 'Go West'],
  },
  caves: {
    name: 'Laser Caves',
    image: '/images/kerona.jpg',
    description: 'You enter a dark cavern. A grid of glowing red laser security beams blocks the way south. East is back to the desert canyon.',
    exits: { west: 'desert_path', south: 'orat_cave' },
    actions: ['Use Glass on Lasers', 'Go South', 'Go West'],
  },
  orat_cave: {
    name: 'Orat Lair',
    image: '/images/kerona.jpg',
    description: 'A deep cave smelling of brimstone. The terrifying, green Orat beast stands in the center, growling menacingly. A narrow path leads east.',
    exits: { north: 'caves', east: 'alien_chamber' },
    actions: ['Throw Dehydrated Water', 'Get Hide', 'Go North', 'Go East'],
  },
  alien_chamber: {
    name: 'Alien Command Center',
    image: '/images/kerona.jpg',
    description: 'A massive holographic alien head floats in the room. It demands proof of the Orat\'s death. Behind it sits a functional hover-skimmer.',
    exits: { west: 'orat_cave' },
    actions: ['Give Hide', 'Enter Skimmer', 'Go West'],
  },

  // --- ACT 3: ULENCE FLATS ---
  ulence_town: {
    name: 'Ulence Flats Speeder Lot',
    image: '/images/ulence.jpg',
    description: 'You park your skimmer in Ulence Flats. A local junk dealer approaches you, eyeing your speeder. North is the Monolith Bar, east is Tiny\'s Ship Shop.',
    exits: { north: 'ulence_bar', east: 'ulence_shop' },
    actions: ['Talk Dealer', 'Sell Skimmer', 'Go North', 'Go East'],
  },
  ulence_bar: {
    name: 'The Monolith Bar',
    image: '/images/ulence.jpg',
    description: 'A lively space bar full of bizarre aliens. A glowing slot machine stands in the corner. South leads back to town.',
    exits: { south: 'ulence_town' },
    actions: ['Play Slots', 'Talk Bartender', 'Clean Floor', 'Go South'],
  },
  ulence_shop: {
    name: 'Tiny\'s Ship Shop',
    image: '/images/ulence.jpg',
    description: 'Tiny sells retro spacecraft. A pilot droid is for sale for 50 Buckazoids. A rusty spaceships stands ready for 100 Buckazoids.',
    exits: { west: 'ulence_town' },
    actions: ['Buy Droid', 'Buy Ship', 'Fly to Deltaur', 'Go West'],
  },

  // --- ACT 4: THE SARIEN CRUISER DELTAUR ---
  deltaur_airlock: {
    name: 'Deltaur Airlock Exterior',
    image: '/images/deltaur.jpg',
    description: 'You float in empty space outside the massive Sarien cruiser Deltaur. A maintenance airlock door lies closed in front of you.',
    exits: {},
    actions: ['Use Jetpack', 'Open Airlock', 'Enter Airlock'],
  },
  deltaur_hallway: {
    name: 'Deltaur Hallway',
    image: '/images/deltaur.jpg',
    description: 'Inside the hostile Sarien ship. Laser turrets scan the rooms. An open laundry chute sits on the wall. The main generator lies east.',
    exits: { east: 'deltaur_generator' },
    actions: ['Enter Laundry Chute', 'Wear Sarien Disguise', 'Go East'],
  },
  deltaur_generator: {
    name: 'Star Generator Chamber',
    image: '/images/deltaur.jpg',
    description: 'The core weapon room. The stolen Star Generator glows in the center. An interactive console panel stands nearby. West returns to hallway.',
    exits: { west: 'deltaur_hallway' },
    actions: ['Look Console', 'Insert Cartridge', 'Type Code 6542', 'Enter Escape Shuttle'],
  }
};

const INITIAL_STATE = {
  currentRoom: 'closet',
  inventory: [],
  score: 0,
  buckazoids: 0,
  selfDestructTime: 300, // 5 mins for Arcada
  deltaurTime: 60, // 60 seconds after trigger
  gameStatus: 'TITLE', // TITLE, PLAYING, DEAD, WON
  logs: ['Welcome to Space Quest I: The Sarien Encounter! Press enter or choose a command.'],
  flags: {
    hasKeycard: false,
    hasCartridge: false,
    hasSpacesuit: false,
    hasTranslator: false,
    scientistDied: false,
    survivalKitOpened: false,
    hasGlass: false,
    boulderPushed: false,
    lasersBypassed: false,
    oratExploded: false,
    hasOratHide: false,
    gaveHideToAlien: false,
    skimmerSold: false,
    hasJetpack: false,
    hasDroid: false,
    hasShip: false,
    usedJetpackAirlock: false,
    enteredAirlock: false,
    hasDisguise: false,
    starGeneratorArmed: false,
    escapedDeltaur: false
  }
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [inputText, setInputText] = useState('');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [dangerAlert, setDangerAlert] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  
  // Slot Machine Overlay State
  const [showSlots, setShowSlots] = useState(false);
  const [slotReels, setSlotReels] = useState(['👽', '👽', '👽']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [slotStatus, setSlotStatus] = useState('Insert Buckazoids to play! (2 Buckazoids/spin)');

  const logEndRef = useRef(null);

  // Auto-scroll the log console to the bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.logs, showSlots]);

  // Timers handler
  useEffect(() => {
    if (state.gameStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      setState(prev => {
        let newSelfDestruct = prev.selfDestructTime;
        let newDeltaur = prev.deltaurTime;
        let newStatus = prev.gameStatus;
        let newLogs = [...prev.logs];

        // Arcada Act (Rooms before escape pod launch)
        const isArcada = ['closet', 'hallway_west', 'hallway_east', 'archive', 'airlock_room', 'pod_bay'].includes(prev.currentRoom);
        if (isArcada && !prev.flags.escapedArcada) {
          if (newSelfDestruct > 0) {
            newSelfDestruct -= 1;
            // Play a warning beep every 30 seconds, or 10 seconds near end
            if (newSelfDestruct % 30 === 0 || (newSelfDestruct < 30 && newSelfDestruct % 5 === 0)) {
              playTone(440, 0.1, 'sawtooth', 0.05);
            }
          } else {
            newStatus = 'DEAD';
            newLogs.push('🚨 The self-destruct countdown hit zero! The spaceship Arcada explodes into stardust, with you inside.');
            playExplosion();
            playDeathSound();
          }
        }

        // Deltaur escape act
        if (prev.flags.starGeneratorArmed && !prev.flags.escapedDeltaur) {
          if (newDeltaur > 0) {
            newDeltaur -= 1;
            if (newDeltaur % 5 === 0) {
              playTone(880, 0.15, 'square', 0.08);
            }
          } else {
            newStatus = 'DEAD';
            newLogs.push('🚨 The Deltaur Star Generator has overloaded and detonated! Roger Wilco vanishes in the explosion.');
            playExplosion();
            playDeathSound();
          }
        }

        return {
          ...prev,
          selfDestructTime: newSelfDestruct,
          deltaurTime: newDeltaur,
          gameStatus: newStatus,
          logs: newLogs
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.gameStatus, state.flags.starGeneratorArmed, state.flags.escapedArcada, state.flags.escapedDeltaur]);

  // Patrol Guard Spawn Logic based on player moves (step count)
  useEffect(() => {
    if (state.gameStatus !== 'PLAYING') return;

    // Sarien guard patrols the corridors in Arcada
    const inArcadaHall = ['hallway_west', 'hallway_east'].includes(state.currentRoom);
    if (inArcadaHall && stepCount > 0 && stepCount % 4 === 0) {
      playTone(100, 0.5, 'sawtooth', 0.15); // low ominous sound
      setState(prev => {
        playLaser();
        playDeathSound();
        return {
          ...prev,
          gameStatus: 'DEAD',
          logs: [...prev.logs, '🚨 Warning footsteps echo! A Sarien guard walks in, sees you, and disintegrates you with his laser pistol!']
        };
      });
    }

    // Deltaur hallways guard patrolling if Roger is not disguised
    if (state.currentRoom === 'deltaur_hallway' && !state.flags.hasDisguise && stepCount > 0) {
      setState(prev => {
        playLaser();
        playDeathSound();
        return {
          ...prev,
          gameStatus: 'DEAD',
          logs: [...prev.logs, '🚨 "Halt Intruder!" Sarien guards spot you without a uniform and open fire. You are vaporized.']
        };
      });
    }
  }, [stepCount]);

  // Danger blinking indicator
  useEffect(() => {
    const isArcada = ['closet', 'hallway_west', 'hallway_east', 'archive', 'airlock_room', 'pod_bay'].includes(state.currentRoom);
    if (state.gameStatus === 'PLAYING' && (isArcada || state.flags.starGeneratorArmed)) {
      setDangerAlert(true);
    } else {
      setDangerAlert(false);
    }
  }, [state.currentRoom, state.gameStatus, state.flags.starGeneratorArmed]);

  // Start Theme music
  const toggleMusic = () => {
    if (musicPlaying) {
      stopThemeMusic();
      setMusicPlaying(false);
    } else {
      playThemeMusic();
      setMusicPlaying(true);
    }
  };

  const startGame = () => {
    playSuccess();
    setState({
      ...INITIAL_STATE,
      gameStatus: 'PLAYING'
    });
    setStepCount(0);
  };

  const addScore = (pts) => {
    playScoreSound();
    setState(prev => ({
      ...prev,
      score: prev.score + pts
    }));
  };

  // Parser helper to normalize inputs
  const parseCommand = (input) => {
    let clean = input.toLowerCase().trim();
    // remove punctuation
    clean = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    
    const words = clean.split(' ');
    const verb = words[0];
    const noun = words.slice(1).join(' ');

    let logMessage = `> ${input}`;
    let reply = '';
    let updatedFlags = { ...state.flags };
    let newRoom = state.currentRoom;
    let newInventory = [...state.inventory];
    let newBuckazoids = state.buckazoids;
    let newStatus = state.gameStatus;

    playBeep();

    // 1. GLOBAL COMMANDS
    if (clean === 'look' || clean === 'look around') {
      reply = ROOMS[state.currentRoom].description;
    } else if (clean === 'inventory' || clean === 'i') {
      reply = state.inventory.length > 0 
        ? `You are carrying: ${state.inventory.join(', ')}.` 
        : 'You are empty-handed.';
    } else if (verb === 'go' || ['north', 'south', 'east', 'west', 'up', 'down'].includes(verb)) {
      const direction = verb === 'go' ? noun : verb;
      const roomExits = ROOMS[state.currentRoom].exits;

      if (roomExits && roomExits[direction]) {
        newRoom = roomExits[direction];
        setStepCount(prev => prev + 1);
        reply = `You walk to the ${direction}. \n${ROOMS[newRoom].description}`;
      } else {
        reply = `You can't go ${direction} from here.`;
      }
    }

    // 2. ACT-SPECIFIC AND ITEM PUZZLES
    else {
      switch (state.currentRoom) {
        // --- BROOM CLOSET ---
        case 'closet':
          if (clean.includes('shelf')) {
            reply = 'The shelves hold old cleaning chemicals and empty boxes. Nothing of use.';
          } else if (clean.includes('bucket') || clean.includes('mop')) {
            reply = 'A rusty bucket and a worn-out mop. You have scrubbed enough decks as a janitor!';
          } else {
            reply = "I don't understand that action in this closet.";
          }
          break;

        // --- WEST HALLWAY ---
        case 'hallway_west':
          reply = "The corridor has flashing red alerts. Better move quickly before the Sarien guards find you!";
          break;

        // --- EAST HALLWAY ---
        case 'hallway_east':
          if (clean.includes('body') || clean.includes('crew') || clean.includes('scientist')) {
            if (clean.startsWith('search') || clean.startsWith('take') || clean.startsWith('get')) {
              if (!state.flags.hasKeycard) {
                updatedFlags.hasKeycard = true;
                newInventory.push('Keycard');
                addScore(10);
                reply = 'You search the dead scientist. Tucked in his jacket, you find a plastic Keycard! You pocket it.';
              } else {
                reply = 'You already searched the body and took the keycard.';
              }
            } else {
              reply = 'It is Jerry from the research division. He appears to have been shot by a Sarien laser. A keycard is poking out of his pocket.';
            }
          } else {
            reply = 'Smoke filters through the hallway. Check the dead body, or proceed north.';
          }
          break;

        // --- DATA ARCHIVE ---
        case 'archive':
          if (clean.includes('scientist') || clean.includes('talk') || clean.includes('examine')) {
            if (!state.flags.scientistDied) {
              updatedFlags.scientistDied = true;
              reply = 'The dying scientist gasps: "Roger... they took... Star Generator. Must destroy Sarien Cruiser... cartridge holds details... console... code is 6542..." He shudders and passes away.';
            } else {
              reply = 'The scientist has passed away. There is nothing more you can do for him.';
            }
          } else if (clean.includes('cartridge') || clean.includes('console')) {
            if (clean.includes('take') || clean.includes('get') || clean.includes('retrieve')) {
              if (!state.flags.hasCartridge) {
                updatedFlags.hasCartridge = true;
                newInventory.push('Data Cartridge');
                addScore(15);
                reply = 'You eject the glowing Data Cartridge from the terminal. You now have the Star Generator cartridge!';
              } else {
                reply = 'You have already taken the Data Cartridge.';
              }
            } else {
              reply = 'The console screen is blinking. A small data cartridge slots into the reader.';
            }
          } else {
            reply = 'The archive room is quiet except for terminal humming. Look at the console or check the scientist.';
          }
          break;

        // --- SPACESUIT CHAMBER ---
        case 'airlock_room':
          if (clean.includes('closet') || clean.includes('locker')) {
            if (clean.startsWith('open')) {
              reply = 'You open the safety lockers. Inside, you see a shiny white Space Suit and a yellow Translator Gadget.';
            } else {
              reply = 'Two metal emergency lockers stand shut on the wall.';
            }
          } else if (clean.includes('suit') || clean.includes('spacesuit')) {
            if (clean.startsWith('take') || clean.startsWith('get') || clean.startsWith('wear')) {
              if (!state.flags.hasSpacesuit) {
                updatedFlags.hasSpacesuit = true;
                newInventory.push('Space Suit');
                addScore(10);
                reply = 'You put on the bulky white Space Suit. It feels snug. You are protected from vacuum!';
              } else {
                reply = 'You are already wearing the Space Suit.';
              }
            } else {
              reply = 'A standard issue StarCon space suit hangs in the locker.';
            }
          } else if (clean.includes('translator') || clean.includes('gadget')) {
            if (clean.startsWith('take') || clean.startsWith('get')) {
              if (!state.flags.hasTranslator) {
                updatedFlags.hasTranslator = true;
                newInventory.push('Translator');
                addScore(10);
                reply = 'You pick up the pocket Translator Gadget. It translates alien dialects in real-time!';
              } else {
                reply = 'You already have the translator gadget.';
              }
            } else {
              reply = 'A yellow electronic translator module is placed on the locker shelf.';
            }
          } else {
            reply = 'Search or open the closets here to prepare for outer space.';
          }
          break;

        // --- ESCAPE POD BAY ---
        case 'pod_bay':
          if (clean.includes('keycard') || clean.includes('use keycard')) {
            if (state.inventory.includes('Keycard')) {
              reply = 'You swipe your keycard on the console reader. The heavy door slides open with a pneumatic hiss, revealing the Escape Pod!';
              addScore(10);
            } else {
              reply = 'You need a Keycard to operate the airlock console.';
            }
          } else if (clean.includes('enter') || clean.includes('pod') || clean.includes('board')) {
            if (state.inventory.includes('Keycard')) {
              reply = 'You climb into the cramped cockpit of the escape pod. The hatch locks behind you. A glowing button reads "LAUNCH".';
            } else {
              reply = 'The escape pod bay door is locked shut.';
            }
          } else if (clean.includes('launch') || clean.includes('press launch') || clean.includes('button')) {
            if (!state.inventory.includes('Space Suit')) {
              newStatus = 'DEAD';
              reply = '💥 You launched the escape pod without securing your Space Suit! Decompression rips through the pod seals. Roger Wilco suffocates.';
              playDeathSound();
            } else {
              updatedFlags.escapedArcada = true;
              newRoom = 'crash_site';
              addScore(20);
              playLaunch();
              reply = '🚀 LAUNCH INITIATED! Rockets roar to life. The escape pod shoots out of the Arcada just as the mothership self-destructs behind you! \n\nYou black out from the G-forces, crash-landing onto the red desert sands of planet Kerona...';
            }
          } else {
            reply = 'Try to open the door, board the escape pod, or configure the launch panels.';
          }
          break;

        // --- KERONA CRASH SITE ---
        case 'crash_site':
          if (clean.includes('pod') || clean.includes('wreckage') || clean.includes('search')) {
            if (!state.flags.survivalKitOpened) {
              updatedFlags.survivalKitOpened = true;
              newInventory.push('Survival Kit');
              addScore(5);
              reply = 'You search the wrecked escape pod. You pull out a survival kit! Command: "Open Kit" to inspect contents.';
            } else {
              reply = 'The pod is heavily damaged and empty.';
            }
          } else if (clean.includes('kit') || clean.includes('open kit')) {
            if (state.inventory.includes('Survival Kit')) {
              // Extract kit items
              newInventory = newInventory.filter(item => item !== 'Survival Kit');
              newInventory.push('Water Canister', 'Dehydrated Water', 'Beacon');
              reply = 'You unpack the survival kit and find: a Water Canister, a pouch of Dehydrated Water, and a homing Beacon!';
              addScore(5);
            } else {
              reply = 'You do not have a survival kit to open.';
            }
          } else if (clean.includes('glass') || clean.includes('ground')) {
            if (!state.flags.hasGlass) {
              updatedFlags.hasGlass = true;
              newInventory.push('Glass');
              addScore(10);
              reply = 'You pick up a sharp, curved piece of volcanic glass lying near the crash crater. It acts like a prism.';
            } else {
              reply = 'There is nothing else of interest on the desert floor.';
            }
          } else {
            reply = 'Your escape pod is wrecked. Look for survival items on the ground or in the pod, then head east.';
          }
          break;

        // --- DESERT PATH (SPIDER DROID) ---
        case 'desert_path':
          if (clean.includes('boulder') || clean.includes('push')) {
            if (!state.flags.boulderPushed) {
              updatedFlags.boulderPushed = true;
              addScore(15);
              playExplosion();
              reply = 'You put your weight against the large boulder on the cliff edge. It shifts, rolling down the canyon and crushing the Sarien Spider Droid below in a satisfying metal crunch!';
            } else {
              reply = 'The boulder has already been pushed down.';
            }
          } else {
            if (!state.flags.boulderPushed) {
              reply = 'You see a metallic spider droid patrolling the canyon ahead. If you try to cross, it will capture you! Perhaps you can use the boulder on the cliff edge.';
            } else {
              reply = 'The canyon is clear. The crushed spider droid lies smoking under the heavy rock.';
            }
          }
          break;

        // --- LASER CAVERN ---
        case 'caves':
          if (clean.includes('glass') || clean.includes('lasers')) {
            if (state.inventory.includes('Glass')) {
              updatedFlags.lasersBypassed = true;
              addScore(20);
              playLaser();
              reply = 'You hold the volcanic glass in front of the laser beams. The crystal prism refracts the crimson beams, overloading the security emitters. The lasers fizzle out! The path south is clear.';
            } else {
              reply = 'Red heat lasers block the path. Crossing them will slice you to ribbons. You need something to refract the light.';
            }
          } else {
            reply = 'A grid of red lasers hums loudly, blocking the cavern passage.';
          }
          break;

        // --- ORAT CAVE ---
        case 'orat_cave':
          if (clean.includes('water') || clean.includes('dehydrated') || clean.includes('canister') || clean.includes('throw')) {
            if (state.inventory.includes('Dehydrated Water') && state.inventory.includes('Water Canister')) {
              updatedFlags.oratExploded = true;
              newInventory = newInventory.filter(i => i !== 'Dehydrated Water' && i !== 'Water Canister');
              addScore(15);
              playExplosion();
              reply = 'You throw the Dehydrated Water pouch at the Orat, then splash it with your Water Canister. The instant water reacts, expanding the Orat rapidly until it explodes into gooey fragments! An Orat hide lies on the ground.';
            } else {
              reply = 'You throw something at the Orat, but it ignores it. You need a chemical/reaction to defeat the beast!';
            }
          } else if (clean.includes('hide') || clean.includes('take hide') || clean.includes('get hide')) {
            if (state.flags.oratExploded && !state.flags.hasOratHide) {
              updatedFlags.hasOratHide = true;
              newInventory.push('Orat Hide');
              addScore(10);
              reply = 'You scoop up the thick, scaly Orat Hide. This should prove you defeated the monster.';
            } else {
              reply = 'There is no hide to collect here.';
            }
          } else {
            if (!state.flags.oratExploded) {
              reply = 'The ferocious green Orat roars, blocking the path. It looks hungry. Do not get too close without a plan!';
            } else {
              reply = 'The cave is silent, coated in green slime. The path east to the chamber is open.';
            }
          }
          break;

        // --- ALIEN COMMAND CHAMBER ---
        case 'alien_chamber':
          if (clean.includes('hide') || clean.includes('give') || clean.includes('use hide')) {
            if (state.inventory.includes('Orat Hide')) {
              updatedFlags.gaveHideToAlien = true;
              newInventory = newInventory.filter(i => i !== 'Orat Hide');
              addScore(15);
              reply = 'You present the Orat Hide to the massive floating head. "Impressive, Roger Wilco," the voice booms. "You have cleansed the planet. You may take our hover-skimmer to flee Kerona!"';
            } else {
              reply = 'The alien head speaks: "Bring me the hide of the Orat, or face your doom!"';
            }
          } else if (clean.includes('skimmer') || clean.includes('enter') || clean.includes('speed')) {
            if (state.flags.gaveHideToAlien) {
              addScore(15);
              newRoom = 'ulence_town';
              playLaunch();
              reply = 'You climb into the hover-skimmer, start the thrusters, and zip across the vast desert dunes, arriving in the settlement of Ulence Flats!';
            } else {
              reply = 'The alien guard field locks the skimmer. You cannot enter it yet.';
            }
          } else {
            reply = 'The alien head demands proof of the Orat\'s defeat before allowing you to touch the speeder.';
          }
          break;

        // --- ULENCE FLATS TOWN ---
        case 'ulence_town':
          if (clean.includes('dealer') || clean.includes('talk') || clean.includes('sell') || clean.includes('speeder') || clean.includes('skimmer')) {
            if (!state.flags.skimmerSold) {
              reply = 'The shady speeder dealer says: "Hey space traveler! Beautiful skimmer. I\'ll give you 10 Buckazoids for it! Accept or refuse?"';
            } else {
              reply = 'You already sold the speeder. The dealer is polishing your old skimmer.';
            }
          } else if (clean === 'accept') {
            if (!state.flags.skimmerSold) {
              updatedFlags.skimmerSold = true;
              newBuckazoids += 10;
              reply = 'You accept the offer. The dealer gives you 10 Buckazoids. That felt like a poor bargain...';
            }
          } else if (clean === 'refuse' || clean === 'no') {
            if (!state.flags.skimmerSold) {
              updatedFlags.skimmerSold = true;
              newBuckazoids += 30;
              newInventory.push('Jetpack');
              addScore(15);
              reply = 'You refuse. The dealer sweats: "Okay! My final offer: 30 Buckazoids AND a military-grade Jetpack!" You accept, putting the buckazoids in your pocket and the jetpack on your back!';
            }
          } else {
            reply = 'An alien outpost. Go north to the Bar to gamble, or east to the Droid/Spaceship shop.';
          }
          break;

        // --- MONOLITH BAR ---
        case 'ulence_bar':
          if (clean.includes('slots') || clean.includes('gamble') || clean.includes('play')) {
            if (state.buckazoids >= 2) {
              setShowSlots(true);
              reply = 'You sit down at the slot machine terminal.';
            } else {
              reply = 'You need at least 2 Buckazoids to play the slot machine.';
            }
          } else if (clean.includes('floor') || clean.includes('clean') || clean.includes('janitor')) {
            newBuckazoids += 5;
            reply = 'Using your StarCon janitorial skills, you sweep and mop the sticky bar floor. The bartender nods and tips you 5 Buckazoids!';
          } else if (clean.includes('bartender') || clean.includes('drink') || clean.includes('talk')) {
            reply = 'The bartender wipes a glass. "Don\'t want no trouble, janitor. Go play the slot machine or visit Tiny\'s shop if you want to leave."';
          } else {
            reply = 'Aliens are chatting and drinking. A slot machine blinks in the corner. You can sweep the floor to earn extra cash.';
          }
          break;

        // --- TINY\'S SHIP SHOP ---
        case 'ulence_shop':
          if (clean.includes('buy droid') || clean.includes('droid')) {
            if (state.flags.hasDroid) {
              reply = 'You already bought the pilot droid.';
            } else if (state.buckazoids >= 50) {
              newBuckazoids -= 50;
              updatedFlags.hasDroid = true;
              newInventory.push('Nav Droid');
              addScore(10);
              reply = 'You hand Tiny 50 Buckazoids. He activates the metallic pilot droid, which rolls over to you, beep-booping cheerfully!';
            } else {
              reply = 'The pilot droid costs 50 Buckazoids. You do not have enough money!';
            }
          } else if (clean.includes('buy ship') || clean.includes('ship')) {
            if (state.flags.hasShip) {
              reply = 'You already bought the starfighter.';
            } else if (state.buckazoids >= 100) {
              newBuckazoids -= 100;
              updatedFlags.hasShip = true;
              newInventory.push('Spaceship');
              addScore(10);
              reply = 'You hand Tiny 100 Buckazoids. He hands you the navigation logs for the rusty old starfighter sitting on the launch pad!';
            } else {
              reply = 'The starfighter costs 100 Buckazoids. You do not have enough money!';
            }
          } else if (clean.includes('fly') || clean.includes('deltaur') || clean.includes('enter ship')) {
            if (state.flags.hasShip && state.flags.hasDroid) {
              newRoom = 'deltaur_airlock';
              playLaunch();
              reply = 'You climb into your starfighter with your pilot droid. You take off, leaving Ulence Flats behind. The droid tracks the Sarien signal, dropping you right outside the massive Sarien cruiser DELTAUR!';
            } else {
              reply = 'You need to purchase both a spaceship and a pilot droid to navigate to the Deltaur.';
            }
          } else {
            reply = 'Tiny shows off his inventory. Droid: 50 Buckazoids. Ship: 100 Buckazoids.';
          }
          break;

        // --- DELTAUR AIRLOCK EXTERIOR ---
        case 'deltaur_airlock':
          if (clean.includes('jetpack') || clean.includes('use jetpack')) {
            if (state.inventory.includes('Jetpack')) {
              updatedFlags.usedJetpackAirlock = true;
              addScore(10);
              reply = 'You ignite your Jetpack. You fly across the void of space, docking safely next to the maintenance hatch.';
            } else {
              reply = 'You do not have a propulsion system to reach the ship!';
            }
          } else if (clean.includes('open') || clean.includes('hatch') || clean.includes('door')) {
            if (state.flags.usedJetpackAirlock) {
              updatedFlags.enteredAirlock = true;
              reply = 'You pull the emergency release lever. The airlock hatch cracks open.';
            } else {
              reply = 'You are floating too far from the ship to reach the door.';
            }
          } else if (clean.includes('enter') || clean.includes('airlock')) {
            if (state.flags.enteredAirlock) {
              newRoom = 'deltaur_hallway';
              addScore(10);
              reply = 'You slip inside the airlock and close it. Welcome aboard the Sarien Cruiser Deltaur! Walk carefully.';
            } else {
              reply = 'The hatch is closed.';
            }
          } else {
            reply = 'You are floating in space. Use your jetpack to fly to the door, open it, and enter.';
          }
          break;

        // --- DELTAUR HALLWAY ---
        case 'deltaur_hallway':
          if (clean.includes('chute') || clean.includes('laundry') || clean.includes('enter chute')) {
            if (!state.flags.hasDisguise) {
              reply = 'You slide down the laundry chute, landing in a bin of dirty Sarien uniforms. You pick out a fresh Sarien suit and helmet, wearing it as a disguise!';
              updatedFlags.hasDisguise = true;
              newInventory.push('Sarien Disguise');
              addScore(15);
            } else {
              reply = 'You already slid down the chute and got a disguise.';
            }
          } else if (clean.includes('wear') || clean.includes('uniform') || clean.includes('disguise')) {
            if (state.flags.hasDisguise) {
              reply = 'You adjust your Sarien helmet. You blend in perfectly!';
            } else {
              reply = 'You do not have a disguise to wear.';
            }
          } else {
            reply = 'Sarien guards patrol these halls. If they see you without a disguise, you are finished. A laundry chute on the wall seems large enough to fit in.';
          }
          break;

        // --- DELTAUR GENERATOR ---
        case 'deltaur_generator':
          if (clean.includes('console') || clean.includes('look console')) {
            reply = 'The main controls has a slot for a Data Cartridge and a numeric keypad. A screen reads: "ENTER SECURITY CODE TO ARMED WEAPON".';
          } else if (clean.includes('cartridge') || clean.includes('use cartridge') || clean.includes('insert')) {
            if (state.inventory.includes('Data Cartridge')) {
              reply = 'You insert the Data Cartridge. The terminal decodes the data, printing: "DEACTIVATION CODE IS: 6542"';
            } else {
              reply = 'You do not have the cartridge containing the security codes.';
            }
          } else if (clean.includes('6542') || clean.includes('destruct') || clean.includes('code') || clean.includes('arm')) {
            if (!state.flags.starGeneratorArmed) {
              updatedFlags.starGeneratorArmed = true;
              addScore(30);
              reply = 'You type in code 6542. 🚨 ALARMS BLOW! Red lights start spinning. A computer voice bellows: "STAR GENERATOR DESTRUCTION PROTOCOL INITIATED. 60 SECONDS TO EXPLOSION." You must escape immediately!';
            } else {
              reply = 'The self-destruct is already running! Escape to the west!';
            }
          } else if (clean.includes('shuttle') || clean.includes('escape') || clean.includes('board') || clean.includes('leave')) {
            if (state.flags.starGeneratorArmed) {
              updatedFlags.escapedDeltaur = true;
              newStatus = 'WON';
              addScore(40);
              playLaunch();
              reply = 'You run to the escape shuttle bay, board a ship, and launch. Behind you, the Sarien Cruiser Deltaur blows up in a spectacular cascade of cosmic fire!';
            } else {
              reply = 'The shuttle doors are locked. You cannot escape yet.';
            }
          } else {
            reply = 'The glowing Star Generator weapon hums. Insert the cartridge to decode the shutdown code, type the code, and trigger the explosion!';
          }
          break;

        default:
          reply = "I don't know how to do that here.";
      }
    }

    // Append to logs
    const newLogs = [...state.logs, logMessage, reply];

    setState(prev => ({
      ...prev,
      currentRoom: newRoom,
      inventory: newInventory,
      buckazoids: newBuckazoids,
      flags: updatedFlags,
      gameStatus: newStatus,
      logs: newLogs
    }));
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      parseCommand(inputText);
    }
  };

  // Helper action clicker
  const executeHelper = (cmd) => {
    parseCommand(cmd);
  };

  // Slots Mechanics
  const spinSlots = () => {
    if (isSpinning || state.buckazoids < 2) return;

    setIsSpinning(true);
    setSlotStatus('Spinning...');
    playLaser();

    // Reels animations simulation
    let count = 0;
    const icons = ['👽', '🍒', '🍋', '🔔', '💎'];
    
    const interval = setInterval(() => {
      setSlotReels([
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        
        // Final reel result
        const finalReels = [
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)]
        ];
        setSlotReels(finalReels);
        setIsSpinning(false);

        // Check outcomes
        let payout = 0;
        let outcomeMsg = '';

        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          const match = finalReels[0];
          if (match === '👽') { payout = 100; outcomeMsg = 'JACKPOT! 3 Aliens! You won 100 Buckazoids!'; }
          else if (match === '💎') { payout = 50; outcomeMsg = 'Nice! 3 Diamonds! You won 50 Buckazoids!'; }
          else if (match === '🔔') { payout = 20; outcomeMsg = '3 Bells! You won 20 Buckazoids!'; }
          else if (match === '🍋') { payout = 10; outcomeMsg = '3 Lemons! You won 10 Buckazoids!'; }
          else if (match === '🍒') { payout = 5; outcomeMsg = '3 Cherries! You won 5 Buckazoids!'; }
        } else {
          payout = -2;
          outcomeMsg = 'No match. You lost 2 Buckazoids.';
        }

        if (payout > 0) {
          playSuccess();
        } else {
          playTone(150, 0.2, 'sawtooth', 0.1);
        }

        setSlotStatus(outcomeMsg);
        setState(prev => ({
          ...prev,
          buckazoids: prev.buckazoids + payout,
          logs: [...prev.logs, `[Slot Machine]: Spun ${finalReels.join(' ')}. ${outcomeMsg}`]
        }));
      }
    }, 100);
  };

  const getInventoryEmoji = (item) => {
    switch (item) {
      case 'Keycard': return '💳';
      case 'Data Cartridge': return '💾';
      case 'Space Suit': return '👨‍🚀';
      case 'Translator': return '📟';
      case 'Water Canister': return '🍶';
      case 'Dehydrated Water': return '🧪';
      case 'Beacon': return '📡';
      case 'Glass': return '💎';
      case 'Orat Hide': return '🦎';
      case 'Jetpack': return '🎒';
      case 'Nav Droid': return '🤖';
      case 'Spaceship': return '🚀';
      case 'Sarien Disguise': return '👽';
      default: return '📦';
    }
  };

  // Time format helper
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="crt-bezel">
      <div className="crt-screen">
        <div className="crt-overlay"></div>

        {/* Title Screen View */}
        {state.gameStatus === 'TITLE' && (
          <div className="title-screen-container">
            <h1 className="logo-main">SPACE QUEST I</h1>
            <h2 className="logo-sub">THE SARIEN ENCOUNTER</h2>
            <div className="start-instructions">
              You are Roger Wilco, a lowly janitor aboard the research spaceship Arcada. 
              Sariens have boarded, stolen the Star Generator weapon, and armed the self-destruct.
              You must escape the ship, survive Kerona, and reclaim the Star Generator!
            </div>
            <button className="retro-btn" onClick={startGame}>
              START MISSION
            </button>
            <div className="keyboard-hint">Type commands like "LOOK", "GET KEYCARD", "GO WEST" to navigate.</div>
            <div className="credits-box">Web Tribute Remake - Antigravity</div>
          </div>
        )}

        {/* Playing Screen View */}
        {state.gameStatus === 'PLAYING' && (
          <>
            {/* Header Dashboard */}
            <div className="game-header">
              <span>SCORE: {state.score.toString().padStart(3, '0')}/202</span>
              <span>💰: {state.buckazoids} BZ</span>
              {['closet', 'hallway_west', 'hallway_east', 'archive', 'airlock_room', 'pod_bay'].includes(state.currentRoom) && !state.flags.escapedArcada ? (
                <span className={state.selfDestructTime < 60 ? "timer-alert" : ""}>
                  🚨 ARCADA DESTRUCT: {formatTime(state.selfDestructTime)}
                </span>
              ) : state.flags.starGeneratorArmed ? (
                <span className="timer-alert">
                  🚨 DELTAUR DESTRUCT: {formatTime(state.deltaurTime)}
                </span>
              ) : (
                <span>SECTOR: SAFE</span>
              )}
            </div>

            {/* Graphics Viewport */}
            <div 
              className="scene-viewport"
              style={{ backgroundImage: `url(${ROOMS[state.currentRoom]?.image || ''})` }}
            >
              {dangerAlert && <div className="red-alert-overlay"></div>}
              
              {/* Roger Wilco Sprite */}
              <div className={`character-sprite ${isSpinning ? 'walking' : ''}`}></div>
            </div>

            {/* Helper Action Buttons */}
            <div className="helper-actions">
              {ROOMS[state.currentRoom]?.actions.map((act) => (
                <button 
                  key={act} 
                  className="action-btn"
                  onClick={() => executeHelper(act)}
                >
                  {act}
                </button>
              ))}
            </div>

            {/* Command Prompt */}
            <div className="console-input-area">
              <span className="console-prompt">ROGER&gt;</span>
              <input 
                type="text"
                className="console-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What should Roger do?"
                autoFocus
              />
            </div>

            {/* Console Output Log */}
            <div className="console-log">
              {state.logs.map((log, index) => (
                <div key={index} className="entry">
                  {log.startsWith('>') ? (
                    <span className="user-cmd">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Inventory belt */}
            <div className="inventory-container">
              <span className="inventory-title">INVENTORY:</span>
              <div className="inventory-grid">
                {[...Array(6)].map((_, i) => {
                  const item = state.inventory[i];
                  return (
                    <div key={i} className={`inventory-slot ${item ? 'occupied' : ''}`}>
                      {item ? (
                        <>
                          <span className="inventory-item-icon">{getInventoryEmoji(item)}</span>
                          <span className="tooltip">{item}</span>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Dead Overlay */}
        {state.gameStatus === 'DEAD' && (
          <div className="modal-overlay">
            <h2 className="modal-title dead">GAME OVER</h2>
            <div className="modal-desc">
              {state.logs[state.logs.length - 1]}
              <br/><br/>
              "Thank you for playing Space Quest I! Better luck next time, space janitor."
            </div>
            <button className="retro-btn" onClick={startGame}>
              RESTORE GAME / RESTART
            </button>
          </div>
        )}

        {/* Won Overlay */}
        {state.gameStatus === 'WON' && (
          <div className="modal-overlay">
            <h2 className="modal-title won">VICTORY!</h2>
            <div className="modal-desc">
              The Star Generator has been destroyed and the Sarien threat is no more! 
              Roger Wilco is hailed as a galactic hero and awarded the coveted Golden Mop!
              <br/><br/>
              FINAL SCORE: {state.score}/202
            </div>
            <button className="retro-btn" onClick={startGame}>
              PLAY AGAIN
            </button>
          </div>
        )}

        {/* Slot Machine Modal */}
        {showSlots && (
          <div className="modal-overlay">
            <div className="slots-container">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--crt-amber)' }}>
                MONOLITH SLOTS
              </h2>
              <div style={{ fontSize: '18px', color: '#fff' }}>
                BUCKAZOIDS: {state.buckazoids} BZ
              </div>
              
              <div className="slots-reels">
                <div className={`slots-reel ${isSpinning ? 'spinning' : ''}`}>
                  {slotReels[0]}
                </div>
                <div className={`slots-reel ${isSpinning ? 'spinning' : ''}`}>
                  {slotReels[1]}
                </div>
                <div className={`slots-reel ${isSpinning ? 'spinning' : ''}`}>
                  {slotReels[2]}
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--crt-green)', fontSize: '20px', minHeight: '48px', textAlign: 'center' }}>
                {slotStatus}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  className="retro-btn" 
                  disabled={isSpinning || state.buckazoids < 2} 
                  onClick={spinSlots}
                >
                  SPIN (2 BZ)
                </button>
                <button 
                  className="retro-btn" 
                  onClick={() => setShowSlots(false)}
                  disabled={isSpinning}
                >
                  LEAVE
                </button>
              </div>

              <div className="slots-payout-text">
                3x👽 = 100 BZ | 3x💎 = 50 BZ<br/>
                3x🔔 = 20 BZ | 3x🍋 = 10 BZ<br/>
                3x🍒 = 5 BZ
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom controls outside the CRT monitor box */}
      <div className="bottom-controls">
        <button className="retro-btn music-btn" onClick={toggleMusic}>
          🎵 {musicPlaying ? 'MUTE MUSIC' : 'PLAY MUSIC'}
        </button>
        <button className="retro-btn" onClick={() => setState({ ...INITIAL_STATE, gameStatus: 'TITLE' })}>
          RESET TO TITLE
        </button>
      </div>

      <div className="power-led"></div>
    </div>
  );
}

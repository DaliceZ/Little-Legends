import { NPCDefinition, DialogueNode } from '../../shared/types';

export const NPC_REGISTRY: Record<string, NPCDefinition> = {
  orin: {
    id: 'orin',
    nameEn: 'Elder Orin',
    nameTh: 'ผู้เฒ่าโอริน',
    titleEn: 'Village Archivist',
    titleTh: 'ผู้ดูแลหอจดหมายเหตุหมู่บ้าน',
    portrait: 'npc_orin',
    initialDialogueNodeId: 'orin_intro',
    role: 'elder',
  },
  mira: {
    id: 'mira',
    nameEn: 'Mira',
    nameTh: 'มิรา',
    titleEn: 'Village Healer',
    titleTh: 'หมอยาแห่งเอเวอร์ไลท์',
    portrait: 'npc_mira',
    initialDialogueNodeId: 'mira_intro',
    role: 'healer',
  },
  rowan: {
    id: 'rowan',
    nameEn: 'Rowan',
    nameTh: 'โรแวน',
    titleEn: 'Master Blacksmith',
    titleTh: 'ช่างตีเหล็กผู้เชี่ยวชาญ',
    portrait: 'npc_rowan',
    initialDialogueNodeId: 'rowan_intro',
    role: 'blacksmith',
  },
  elara: {
    id: 'elara',
    nameEn: 'Elara',
    nameTh: 'เอลารา',
    titleEn: 'Guild Master',
    titleTh: 'หัวหน้ากิลด์นักผจญภัย',
    portrait: 'npc_elara',
    initialDialogueNodeId: 'elara_intro',
    role: 'guild',
  },
  finn: {
    id: 'finn',
    nameEn: 'Finn',
    nameTh: 'ฟินน์',
    titleEn: 'General Merchant',
    titleTh: 'พ่อค้าเร่ประจำหมู่บ้าน',
    portrait: 'npc_finn',
    initialDialogueNodeId: 'finn_intro',
    role: 'merchant',
  },
};

export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  // Elder Orin
  orin_intro: {
    id: 'orin_intro',
    npcId: 'orin',
    textEn: 'Ah, young Kael. That crystal on your chest hums with the resonance of the Ancient Echo. Do you recall anything of your past?',
    textTh: 'โอ้ เจ้าหนุ่มเคล ผลึกบนอกของเจ้าส่งเสียงสะท้อนแห่งอดีตกาลก้องกังวาน เจ้าจำเรื่องราวในอดีตได้บ้างหรือยัง?',
    choices: [
      {
        textEn: 'My memory is blank, Elder. Only the crystal guides me.',
        textTh: 'ข้ายังจำอะไรไม่ได้เลยท่านผู้เฒ่า มีเพียงความรู้สึกเชื่อมโยงกับผลึกนี้เท่านั้น',
        nextNodeId: 'orin_quest_offer',
      },
      {
        textEn: 'Tell me about Everlight Village.',
        textTh: 'ช่วยเล่าเรื่องเกี่ยวกับหมู่บ้านเอเวอร์ไลท์ให้ข้าฟังหน่อย',
        nextNodeId: 'orin_lore',
      },
      {
        textEn: 'I must be going.',
        textTh: 'ข้าขอตัวก่อน',
        action: 'close',
      },
    ],
  },
  orin_quest_offer: {
    id: 'orin_quest_offer',
    npcId: 'orin',
    textEn: 'The Whispering Forest is overrun by agitated slimes and bats. Clear the forest outskirts to prove your strength so Elara opens the ancient dungeon gates.',
    textTh: 'ป่าเสียงกระซิบตอนนี้น่าเป็นห่วง สไลม์และค้างคาวกำลังอาละวาด จงไปกำจัดพวกมันบริเวณชายป่าเพื่อพิสูจน์ฝีมือ แล้วเอลาราจะยอมเปิดประตูดันเจี้ยนโบราณให้เจ้า',
    choices: [
      {
        textEn: 'I will cleanse the forest outskirts.',
        textTh: 'ข้าจะไปจัดการพวกมันให้',
        action: 'accept_quest',
        actionPayload: 'quest_cleansing_forest',
      },
      {
        textEn: 'Not right now.',
        textTh: 'ยังไม่ใช่ตอนนี้',
        action: 'close',
      },
    ],
  },
  orin_lore: {
    id: 'orin_lore',
    npcId: 'orin',
    textEn: 'Everlight Village was erected around a peaceful ley line. We live in harmony with the forest, but the tremors from the ruins grow deeper each night.',
    textTh: 'หมู่บ้านเอเวอร์ไลท์ก่อตั้งขึ้นบนแนวสายธารพลังงานอันสงบสุข เราอยู่ร่วมกับธรรมชาติมาช้านาน แต่เสียงสั่นสะเทือนจากซากโบราณสถานกลับทวีความรุนแรงขึ้นทุกค่ำคืน',
    choices: [
      {
        textEn: 'I understand.',
        textTh: 'ข้าเข้าใจแล้ว',
        nextNodeId: 'orin_intro',
      },
    ],
  },

  // Mira - Village Healer
  mira_intro: {
    id: 'mira_intro',
    npcId: 'mira',
    textEn: 'Welcome back, Kael! Let me mend your wounds with soothing herbal warmth.',
    textTh: 'ยินดีต้อนรับกลับมานะเคล! ให้ข้าช่วยรักษาบาดแผลด้วยสมุนไพรอบอุ่นให้เจ้านะ',
    choices: [
      {
        textEn: 'Please restore my health and energy.',
        textTh: 'โปรดช่วยรักษาพลังชีวิตและฟื้นฟูเรี่ยวแรงให้ข้าที',
        nextNodeId: 'mira_healed',
        action: 'claim_reward',
        actionPayload: 'heal_player',
      },
      {
        textEn: 'Do you need any forest herbs?',
        textTh: 'เจ้าต้องการสมุนไพรจากป่าบ้างหรือไม่?',
        nextNodeId: 'mira_quest_offer',
      },
      {
        textEn: 'Farewell for now.',
        textTh: 'ไว้เจอกันนะ',
        action: 'close',
      },
    ],
  },
  mira_healed: {
    id: 'mira_healed',
    npcId: 'mira',
    textEn: 'There you are! Your vitality is completely restored. Stay safe out there!',
    textTh: 'เรียบร้อยแล้วจ้า! พลังชีวิตและมานาของเจ้าฟื้นฟูเต็มเปี่ยมแล้ว ขอให้ปลอดภัยนะ!',
    choices: [
      {
        textEn: 'Thank you, Mira!',
        textTh: 'ขอบคุณมากนะมิรา!',
        action: 'close',
      },
    ],
  },
  mira_quest_offer: {
    id: 'mira_quest_offer',
    npcId: 'mira',
    textEn: 'I am running desperately low on Slime Jelly for my soothing salves. Could you bring me 4 jars of Slime Jelly from the forest?',
    textTh: 'ข้ากำลังขาดแคลนเมือกสไลม์สำหรับปรุงยาสมานแผล เจ้าพอจะช่วยเก็บเมือกสไลม์มาให้ข้าสัก 4 ชิ้นได้ไหม?',
    choices: [
      {
        textEn: 'Consider it done.',
        textTh: 'ได้เลย ข้าจะไปนำมาให้',
        action: 'accept_quest',
        actionPayload: 'quest_mira_herbs',
      },
      {
        textEn: 'Maybe later.',
        textTh: 'ไว้โอกาสหน้านะ',
        action: 'close',
      },
    ],
  },

  // Rowan - Blacksmith
  rowan_intro: {
    id: 'rowan_intro',
    npcId: 'rowan',
    textEn: 'The forge burns hot today! Need a sharper blade or stronger iron plate, wanderer?',
    textTh: 'เตาหลอมกำลังลุกโชน! ต้องการดาบที่คมขึ้น หรือเกราะเหล็กที่หนากว่าเดิมไหม เจ้าหนุ่มนักพเนจร?',
    choices: [
      {
        textEn: 'Show me what you can craft.',
        textTh: 'เปิดดูรายการสร้างและอัปเกรดอุปกรณ์',
        action: 'open_craft',
      },
      {
        textEn: 'Do you have any tasks for me?',
        textTh: 'เจ้ามีงานให้ข้าช่วยทำบ้างไหม?',
        nextNodeId: 'rowan_quest_offer',
      },
      {
        textEn: 'Just browsing the forge.',
        textTh: 'ข้าแค่แวะมาดูเตาหลอมน่ะ',
        action: 'close',
      },
    ],
  },
  rowan_quest_offer: {
    id: 'rowan_quest_offer',
    npcId: 'rowan',
    textEn: 'The wild wolves in the deeper woods have been troubling our supply wagons. Bring me 2 Wild Wolf Pelts and I will reinforce your armor for free!',
    textTh: 'พวกหมาป่าพงไพรในป่าลึกกำลังรบกวนขบวนเกวียนขนเสบียง นำหนังหมาป่า 2 ผืนมาให้ข้า แล้วข้าจะเสริมเกราะให้เจ้าเป็นพิเศษ!',
    choices: [
      {
        textEn: 'I will hunt the wolves.',
        textTh: 'ข้าจะไปจัดการหมาป่าให้',
        action: 'accept_quest',
        actionPayload: 'quest_rowan_pelts',
      },
      {
        textEn: 'Not right now.',
        textTh: 'ยังไม่สะดวกในตอนนี้',
        action: 'close',
      },
    ],
  },

  // Elara - Guild Master
  elara_intro: {
    id: 'elara_intro',
    npcId: 'elara',
    textEn: 'Greetings, Kael. The Wayfarer Guild watches over the dungeon depths. Are you prepared to challenge the Endless Echo Ruins?',
    textTh: 'ยินดีต้อนรับเคล กิลด์นักผจญภัยกำลังเฝ้าระวังส่วนลึกของดันเจี้ยนโบราณ เจ้าพร้อมที่จะเผชิญหน้ากับความท้าทายในซากโบราณสถานแล้วหรือยัง?',
    choices: [
      {
        textEn: 'Authorize my dungeon expedition.',
        textTh: 'ขออนุญาตลงสำรวจดันเจี้ยนโบราณ',
        nextNodeId: 'elara_dungeon_ready',
      },
      {
        textEn: 'What lurks at the bottom of the ruins?',
        textTh: 'มีสิ่งใดซ่อนอยู่ใต้ก้นบึ้งของซากโบราณสถาน?',
        nextNodeId: 'elara_boss_lore',
      },
      {
        textEn: 'I need more preparation.',
        textTh: 'ข้าขอเวลาเตรียมตัวก่อน',
        action: 'close',
      },
    ],
  },
  elara_dungeon_ready: {
    id: 'elara_dungeon_ready',
    npcId: 'elara',
    textEn: 'The gateway at the north cliff is open. Defeat the Ancient Golem and recover an Echo Heart!',
    textTh: 'ประตูกลไกโบราณทางเหนือเปิดแล้ว จงกำจัดโกเลมศิลาโบราณและนำหัวใจเอคโค่กลับมา!',
    choices: [
      {
        textEn: 'Accept Dungeon Bounty: Slay the Ancient Golem',
        textTh: 'รับภารกิจกิลด์: ปราบโกเลมศิลาโบราณ',
        action: 'accept_quest',
        actionPayload: 'quest_defeat_golem',
      },
      {
        textEn: 'Understood.',
        textTh: 'รับทราบ',
        action: 'close',
      },
    ],
  },
  elara_boss_lore: {
    id: 'elara_boss_lore',
    npcId: 'elara',
    textEn: 'The Ancient Golem—a titan assembled by forgotten architects. Watch its ground slams and energy charge telegraphs carefully.',
    textTh: 'โกเลมศิลาโบราณ... ผู้พิทักษ์ร่างยักษ์ที่ถูกสร้างขึ้นโดยสถาปนิกในอดีต จงระวังท่าทุบพื้นและการชาร์จพลังงานของมันให้ดี',
    choices: [
      {
        textEn: 'Thank you for the warning.',
        textTh: 'ขอบคุณสำหรับคำเตือน',
        nextNodeId: 'elara_intro',
      },
    ],
  },

  // Finn - Merchant
  finn_intro: {
    id: 'finn_intro',
    npcId: 'finn',
    textEn: 'Fresh potions, sturdy gear, and strange curiosities! Step right up, adventurer!',
    textTh: 'น้ำยาฟื้นฟูสดใหม่ อุปกรณ์คุณภาพ และของแปลกตาจากแดนไกล! เชิญแวะชมก่อนได้เลยท่านนักผจญภัย!',
    choices: [
      {
        textEn: 'Open Store Goods',
        textTh: 'เปิดดูสินค้าในร้าน',
        action: 'open_shop',
      },
      {
        textEn: 'Have you seen any crystals like mine?',
        textTh: 'เจ้าเคยเห็นผลึกที่เหมือนของข้าบ้างไหม?',
        nextNodeId: 'finn_crystal_rumor',
      },
      {
        textEn: 'See you later, Finn.',
        textTh: 'ไว้เจอกันนะฟินน์',
        action: 'close',
      },
    ],
  },
  finn_crystal_rumor: {
    id: 'finn_crystal_rumor',
    npcId: 'finn',
    textEn: 'None with that exact blue hue, Kael. But miners speak of crystal veins deep in the caverns that sing when struck. Bring me anything shiny you unearth!',
    textTh: 'ข้าไม่เคยเห็นผลึกสีฟ้าสดใสเช่นนี้มาก่อนเลย แต่คนงานเหมืองเล่าว่ามีสายแร่ผลึกในถ้ำลึกที่ส่งเสียงร้องเพลงได้เมื่อถูกเคาะ หากเจ้าพบเจออะไรแวววาว นำมาขายให้ข้าได้เสมอนะ!',
    choices: [
      {
        textEn: 'I will keep that in mind.',
        textTh: 'ข้าจะจำไว้',
        nextNodeId: 'finn_intro',
      },
    ],
  },
};

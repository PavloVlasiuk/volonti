import 'dotenv/config';
import { DataSource, QueryRunner } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

type Row = { id: string };

async function one(
  qr: QueryRunner,
  sql: string,
  params: unknown[],
): Promise<Row | undefined> {
  const rows: Row[] = await qr.query(sql, params);
  return rows[0];
}

async function insert(
  qr: QueryRunner,
  sql: string,
  params: unknown[],
): Promise<string> {
  const rows: Row[] = await qr.query(sql, params);
  return rows[0].id;
}

import {
  FormatType,
  InitiativeStatus,
  InitiativeType,
  OrgStatus,
  OrgType,
  UserRole,
} from '../src/common/enums';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'volonti',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  synchronize: false,
  entities: [join(__dirname, '../src/modules/**/*.entity{.ts,.js}')],
});

async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ── Categories ────────────────────────────────────────────────────────────
    const categoryNames = [
      'Соціальна підтримка',
      'Освіта та наставництво',
      'Екологія та довкілля',
      'Медична допомога',
      'Допомога тваринам',
      'Гуманітарна допомога',
      'Допомога ветеранам',
      'Психологічна підтримка',
      'Спортивні заходи',
      'Культурні заходи',
    ];

    const catIds: Record<string, string> = {};
    for (const name of categoryNames) {
      const existing = await one(
        qr,
        `SELECT id FROM categories WHERE name = $1`,
        [name],
      );
      catIds[name] = existing
        ? existing.id
        : await insert(
            qr,
            `INSERT INTO categories (name) VALUES ($1) RETURNING id`,
            [name],
          );
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    const existingAdmin = await one(
      qr,
      `SELECT id FROM users WHERE email = $1`,
      ['admin@volonti.ua'],
    );
    if (!existingAdmin) {
      await qr.query(
        `INSERT INTO users (email, password_hash, role, email_verified) VALUES ($1, $2, $3, true)`,
        ['admin@volonti.ua', passwordHash, UserRole.ADMIN],
      );
    }

    // ── Organizations ─────────────────────────────────────────────────────────
    const orgData = [
      {
        email: 'plich-o-plich@volonti.ua',
        name: 'Благодійний фонд «Пліч-о-пліч»',
        type: OrgType.CHARITY,
        edrpou: '40112233',
        contactPerson: 'Олена Коваленко',
        verifiedAt: new Date('2025-01-15'),
      },
      {
        email: 'zelena-kraina@volonti.ua',
        name: 'ГО «Зелена країна»',
        type: OrgType.NGO,
        edrpou: '41223344',
        contactPerson: 'Богдан Мельник',
        verifiedAt: new Date('2025-02-20'),
      },
      {
        email: 'opora@volonti.ua',
        name: 'Кризовий центр «Опора»',
        type: OrgType.CRISIS_CENTER,
        edrpou: '42334455',
        contactPerson: 'Ірина Шевченко',
        verifiedAt: new Date('2024-11-10'),
      },
      {
        email: 'lapa-v-doloni@volonti.ua',
        name: 'Прихисток «Лапа в долоні»',
        type: OrgType.NGO,
        edrpou: '43445566',
        contactPerson: 'Андрій Ткаченко',
        verifiedAt: new Date('2025-03-05'),
      },
      {
        email: 'razom@volonti.ua',
        name: 'Міський центр «Разом»',
        type: OrgType.MUNICIPAL,
        edrpou: '44556677',
        contactPerson: 'Марія Гончарук',
        verifiedAt: new Date('2025-01-28'),
      },
    ];

    const orgIds: string[] = [];
    for (const org of orgData) {
      const existingOrg = await one(
        qr,
        `SELECT id FROM organizations WHERE edrpou = $1`,
        [org.edrpou],
      );
      orgIds.push(
        existingOrg
          ? existingOrg.id
          : await insert(
              qr,
              `INSERT INTO organizations (name, type, edrpou, contact_person, email, password_hash, status, verified_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
              [
                org.name,
                org.type,
                org.edrpou,
                org.contactPerson,
                org.email,
                passwordHash,
                OrgStatus.VERIFIED,
                org.verifiedAt,
              ],
            ),
      );
    }

    // ── Initiatives ───────────────────────────────────────────────────────────
    const initiativeData = [
      // ── Org 0 · Благодійний фонд «Пліч-о-пліч» (Київ) ─────────────────────────
      {
        orgIdx: 0,
        title: 'Продуктові набори для переселенців',
        description:
          'Формуємо та видаємо продуктові набори внутрішньо переміщеним особам. Потрібні волонтери для сортування продуктів, комплектування пакунків та видачі їх отримувачам.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: 18,
        requirements:
          'Фізична витривалість, відповідальність, готовність працювати в команді',
        startsAt: '2026-06-01',
        endsAt: '2026-09-30',
        category: 'Гуманітарна допомога',
      },
      {
        orgIdx: 0,
        title: 'Супровід людей з інвалідністю',
        description:
          'Допомагаємо людям з інвалідністю у щоденних справах: супровід до лікарні, на прогулянки, допомога з покупками та оформленням документів.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: 18,
        requirements: 'Терпіння, емпатія, базові навички комунікації',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Соціальна підтримка',
      },
      {
        orgIdx: 0,
        title: 'Навчання домедичній допомозі',
        description:
          'Проводимо безкоштовні курси домедичної допомоги для цивільних. Шукаємо волонтерів-інструкторів та помічників для організації занять.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: 16,
        requirements:
          'Сертифікат з домедичної допомоги (для інструкторів) або готовність допомагати з організацією',
        startsAt: '2026-07-05',
        endsAt: '2026-07-26',
        category: 'Медична допомога',
      },
      {
        orgIdx: 0,
        title: 'Адаптаційний простір для ветеранів',
        description:
          'Облаштовуємо та підтримуємо простір для зустрічей ветеранів та ветеранок. Потрібна допомога з організацією заходів, спілкуванням та супроводом.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: 21,
        requirements: 'Емпатія, стресостійкість, повага до досвіду військових',
        startsAt: '2026-05-15',
        endsAt: '2026-12-31',
        category: 'Допомога ветеранам',
      },
      {
        orgIdx: 0,
        title: 'Збір коштів на реабілітаційне обладнання',
        description:
          'Організовуємо онлайн-кампанію зі збору коштів на реабілітаційне обладнання для шпиталів. Потрібні волонтери для роботи із соцмережами та комунікації з донорами.',
        type: InitiativeType.PLANNED,
        format: FormatType.REMOTE,
        city: null,
        minAge: 16,
        requirements:
          'Впевнене користування соцмережами, грамотна письмова мова',
        startsAt: '2026-06-10',
        endsAt: '2026-08-10',
        category: 'Медична допомога',
      },

      // ── Org 1 · ГО «Зелена країна» (Львів) ────────────────────────────────────
      {
        orgIdx: 1,
        title: 'Прибирання берегів Дністра',
        description:
          'Масштабне прибирання берегової лінії Дністра від сміття. Забезпечуємо інвентар та рукавиці — від вас гарний настрій та бажання допомогти природі.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Львів',
        minAge: 14,
        requirements: 'Зручний одяг та взуття',
        startsAt: '2026-06-07',
        endsAt: '2026-06-07',
        category: 'Екологія та довкілля',
      },
      {
        orgIdx: 1,
        title: 'Еко-забіг «Чисте місто»',
        description:
          'Благодійний забіг, поєднаний із прибиранням міста (плоггінг). Шукаємо волонтерів для реєстрації учасників, роботи на пунктах та координації маршруту.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Львів',
        minAge: 16,
        requirements: null,
        startsAt: '2026-07-19',
        endsAt: '2026-07-19',
        category: 'Спортивні заходи',
      },
      {
        orgIdx: 1,
        title: 'Уроки еко-грамотності для школярів',
        description:
          'Проводимо інтерактивні уроки про сортування сміття та збереження довкілля у школах Львова. Потрібні волонтери-лектори.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Львів',
        minAge: 18,
        requirements: 'Досвід роботи з дітьми або педагогічна освіта вітається',
        startsAt: '2026-09-01',
        endsAt: '2026-12-20',
        category: 'Освіта та наставництво',
      },
      {
        orgIdx: 1,
        title: 'Висадка дерев у міських парках',
        description:
          'Висаджуємо саджанці дерев у парках та скверах міста для відновлення зелених зон. Долучитися можуть усі охочі, навіть родини з дітьми.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Львів',
        minAge: null,
        requirements: null,
        startsAt: '2026-10-04',
        endsAt: '2026-10-05',
        category: 'Екологія та довкілля',
      },
      {
        orgIdx: 1,
        title: 'Онлайн-курс зеленого активізму',
        description:
          'Розробляємо та проводимо онлайн-курс для молоді про екологічний активізм та сталий спосіб життя. Потрібні автори контенту та модератори.',
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 16,
        requirements: "Впевнене користування комп'ютером, інтерес до екотематики",
        startsAt: '2026-06-15',
        endsAt: '2026-09-15',
        category: 'Освіта та наставництво',
      },

      // ── Org 2 · Кризовий центр «Опора» (Дніпро) ───────────────────────────────
      {
        orgIdx: 2,
        title: 'Онлайн-консультації для постраждалих',
        description:
          'Надаємо безкоштовні онлайн-консультації психологічної підтримки людям, що постраждали від війни. Шукаємо психологів та психотерапевтів.',
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 21,
        requirements: 'Психологічна освіта та досвід консультування',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Психологічна підтримка',
      },
      {
        orgIdx: 2,
        title: 'Групи підтримки для ветеранів',
        description:
          'Ведемо регулярні групи взаємопідтримки для ветеранів. Потрібні фасилітатори та волонтери для організації зустрічей.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Дніпро',
        minAge: 21,
        requirements: 'Навички фасилітації або готовність пройти навчання',
        startsAt: '2026-05-20',
        endsAt: '2026-12-31',
        category: 'Допомога ветеранам',
      },
      {
        orgIdx: 2,
        title: 'Денний центр для людей похилого віку',
        description:
          'Організовуємо дозвілля та спілкування для самотніх людей похилого віку у денному центрі. Допомога із заняттями, чаюваннями та прогулянками.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Дніпро',
        minAge: 18,
        requirements: 'Доброзичливість, терпіння',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Соціальна підтримка',
      },
      {
        orgIdx: 2,
        title: 'Лінія емоційної підтримки',
        description:
          "Чергуємо на телефонній лінії емоційної підтримки. Шукаємо волонтерів із навичками активного слухання після обов'язкового навчання.",
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 21,
        requirements:
          'Готовність пройти навчання, емоційна стійкість, чіткий графік чергувань',
        startsAt: '2026-07-01',
        endsAt: null,
        category: 'Психологічна підтримка',
      },
      {
        orgIdx: 2,
        title: 'Майстерні для родин загиблих',
        description:
          'Проводимо терапевтичні творчі майстерні для родин полеглих захисників. Потрібні волонтери-ведучі та помічники.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Дніпро',
        minAge: 25,
        requirements:
          'Психологічна освіта або значний досвід волонтерства у кризових ситуаціях',
        startsAt: '2026-08-02',
        endsAt: '2026-08-30',
        category: 'Допомога ветеранам',
      },

      // ── Org 3 · Прихисток «Лапа в долоні» (Одеса) ─────────────────────────────
      {
        orgIdx: 3,
        title: 'Догляд за тваринами у притулку',
        description:
          'Щоденний догляд за тваринами притулку: годування, прибирання вольєрів, спілкування та соціалізація собак і котів.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Одеса',
        minAge: 16,
        requirements: 'Любов до тварин, відсутність алергії, охайність',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Допомога тваринам',
      },
      {
        orgIdx: 3,
        title: 'Термінова допомога з вигулом собак',
        description:
          'Притулок переповнений — терміново потрібні волонтери для щоденного вигулу собак. Кожна пара рук на вагу золота!',
        type: InitiativeType.URGENT,
        format: FormatType.ON_SITE,
        city: 'Одеса',
        minAge: 16,
        requirements: null,
        startsAt: '2026-06-05',
        endsAt: '2026-07-15',
        category: 'Допомога тваринам',
      },
      {
        orgIdx: 3,
        title: 'Прибирання прибережної зони',
        description:
          'Прибираємо узбережжя Чорного моря від пластику та сміття разом із нашими хвостатими підопічними. Сімейний формат.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Одеса',
        minAge: 14,
        requirements: 'Зручний одяг та взуття',
        startsAt: '2026-07-12',
        endsAt: '2026-07-12',
        category: 'Екологія та довкілля',
      },
      {
        orgIdx: 3,
        title: 'Пошук нових родин для тварин',
        description:
          'Робимо фото, пишемо історії та публікуємо оголошення про прилаштування тварин у соцмережах. Можна допомагати з будь-якого міста.',
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 16,
        requirements:
          'Навички фотографії або копірайтингу, активність у соцмережах',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Допомога тваринам',
      },
      {
        orgIdx: 3,
        title: 'Уроки відповідального ставлення до тварин',
        description:
          'Проводимо просвітницькі заняття для школярів про відповідальне ставлення до тварин та гуманне поводження.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Одеса',
        minAge: 18,
        requirements: 'Досвід роботи з дітьми вітається',
        startsAt: '2026-09-10',
        endsAt: '2026-11-10',
        category: 'Допомога тваринам',
      },

      // ── Org 4 · Міський центр «Разом» (Харків) ────────────────────────────────
      {
        orgIdx: 4,
        title: 'Волонтери міського фестивалю мистецтв',
        description:
          'Допомога в організації міського фестивалю мистецтв: зустріч гостей, навігація, робота інфопунктів та підтримка артистів.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 16,
        requirements: 'Комунікабельність, відповідальність',
        startsAt: '2026-08-22',
        endsAt: '2026-08-24',
        category: 'Культурні заходи',
      },
      {
        orgIdx: 4,
        title: 'Харківський напівмарафон: волонтери на трасі',
        description:
          'Великий напівмарафон шукає волонтерів для роботи на пунктах гідратації, видачі стартових пакетів та підтримки бігунів на трасі.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 18,
        requirements:
          'Фізична витривалість, готовність працювати в день заходу з раннього ранку',
        startsAt: '2026-09-13',
        endsAt: '2026-09-13',
        category: 'Спортивні заходи',
      },
      {
        orgIdx: 4,
        title: 'Безкоштовні мовні клуби для дітей ВПО',
        description:
          'Проводимо безкоштовні розмовні клуби з англійської мови для дітей внутрішньо переміщених осіб. Потрібні волонтери з гарним рівнем мови.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 18,
        requirements: 'Рівень англійської від B2, бажання працювати з дітьми',
        startsAt: '2026-09-01',
        endsAt: '2026-12-20',
        category: 'Освіта та наставництво',
      },
      {
        orgIdx: 4,
        title: 'Допомога самотнім людям похилого віку',
        description:
          'Відвідуємо самотніх людей похилого віку: допомога з покупками, ліками, прибиранням та просто спілкування.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 18,
        requirements: 'Доброзичливість, пунктуальність',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Соціальна підтримка',
      },
      {
        orgIdx: 4,
        title: 'Екскурсії-відновлення: гіди вихідного дня',
        description:
          'Проводимо безкоштовні екскурсії історичним центром міста для містян та гостей, привертаючи увагу до відновлення культурної спадщини.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 18,
        requirements: 'Знання історії міста, навички публічних виступів',
        startsAt: '2026-07-26',
        endsAt: '2026-10-26',
        category: 'Культурні заходи',
      },
    ];

    for (const init of initiativeData) {
      const existing = await one(
        qr,
        `SELECT id FROM initiatives WHERE title = $1 AND organization_id = $2`,
        [init.title, orgIds[init.orgIdx]],
      );
      if (!existing) {
        await insert(
          qr,
          `INSERT INTO initiatives
             (title, description, type, format, city, min_age, requirements,
              starts_at, ends_at, status, organization_id, category_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
          [
            init.title,
            init.description,
            init.type,
            init.format,
            init.city,
            init.minAge,
            init.requirements,
            init.startsAt,
            init.endsAt,
            InitiativeStatus.ACTIVE,
            orgIds[init.orgIdx],
            catIds[init.category],
          ],
        );
      }
    }

    await qr.commitTransaction();
    console.log('Seed completed successfully');
    console.log('  Categories:', categoryNames.length);
    console.log('  Organizations:', orgData.length, '(+ 1 admin)');
    console.log('  Initiatives:', initiativeData.length);
    console.log('  Default password for all users: Password123!');
  } catch (err) {
    await qr.rollbackTransaction();
    console.error('Seed failed:', err);
    throw err;
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed().catch(() => process.exit(1));

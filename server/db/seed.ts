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
  ApplicationStatus,
  FormatPreference,
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
      'Культура та мистецтво',
      'IT та технології',
      'Гуманітарна допомога',
      'Допомога ветеранам',
      'Психологічна підтримка',
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
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
        ['admin@volonti.ua', passwordHash, UserRole.ADMIN],
      );
    }

    // ── Organizations ─────────────────────────────────────────────────────────
    const orgData = [
      {
        email: 'serce@volonti.ua',
        name: 'Фонд "Серце України"',
        type: OrgType.CHARITY,
        edrpou: '12345678',
        contactPerson: 'Олена Коваленко',
        verifiedAt: new Date('2025-01-15'),
      },
      {
        email: 'zelenaxvylya@volonti.ua',
        name: 'ГО "Зелена Хвиля"',
        type: OrgType.NGO,
        edrpou: '87654321',
        contactPerson: 'Богдан Мельник',
        verifiedAt: new Date('2025-02-20'),
      },
      {
        email: 'nadiya@volonti.ua',
        name: 'Кризовий центр "Надія"',
        type: OrgType.CRISIS_CENTER,
        edrpou: '11223344',
        contactPerson: 'Ірина Шевченко',
        verifiedAt: new Date('2024-11-10'),
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
      // Серце України
      {
        orgIdx: 0,
        title: 'Роздача гуманітарної допомоги переселенцям',
        description:
          'Допомагаємо внутрішньо переміщеним особам отримати базові продукти харчування, одяг та засоби гігієни. Потрібні волонтери для сортування та видачі пакунків.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: 18,
        requirements: 'Фізична витривалість, готовність працювати у команді',
        startsAt: '2026-05-15',
        endsAt: '2026-08-31',
        category: 'Гуманітарна допомога',
      },
      {
        orgIdx: 0,
        title: 'Психологічна підтримка онлайн',
        description:
          'Проведення онлайн-сесій психологічної підтримки для постраждалих від війни. Шукаємо психологів та людей з навичками активного слухання.',
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 21,
        requirements: 'Базові знання психології або готовність пройти навчання',
        startsAt: '2026-06-01',
        endsAt: null,
        category: 'Психологічна підтримка',
      },
      {
        orgIdx: 0,
        title: 'Благодійний концерт для збору коштів на медичне обладнання',
        description:
          'Організація благодійного концерту та ярмарку для збору коштів на придбання медичного обладнання для шпиталів.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Львів',
        minAge: 16,
        requirements: null,
        startsAt: '2026-07-10',
        endsAt: '2026-07-12',
        category: 'Медична допомога',
      },
      // Зелена Хвиля
      {
        orgIdx: 1,
        title: 'Весняне прибирання парку "Голосіїво"',
        description:
          'Весняне прибирання одного з найбільших парків Києва. Збираємо волонтерів для прибирання, висадки квітів та покраски лавок.',
        type: InitiativeType.PLANNED,
        format: FormatType.ON_SITE,
        city: 'Київ',
        minAge: null,
        requirements: 'Зручний одяг та взуття',
        startsAt: '2026-05-20',
        endsAt: '2026-05-20',
        category: 'Екологія та довкілля',
      },
      {
        orgIdx: 1,
        title: 'Онлайн-курс екологічної грамотності для школярів',
        description:
          'Розробка та проведення безкоштовного онлайн-курсу для школярів про сортування сміття, збереження довкілля та кліматичні зміни.',
        type: InitiativeType.PLANNED,
        format: FormatType.REMOTE,
        city: null,
        minAge: 18,
        requirements:
          "Досвід у педагогіці або екології, впевнене користування комп'ютером",
        startsAt: '2026-06-15',
        endsAt: '2026-09-15',
        category: 'Освіта та наставництво',
      },
      {
        orgIdx: 1,
        title: 'Масова висадка дерев у Харкові',
        description:
          'Масова висадка дерев у парках та на вулицях Харкова для відновлення зеленого покриву міста.',
        type: InitiativeType.URGENT,
        format: FormatType.ON_SITE,
        city: 'Харків',
        minAge: 14,
        requirements: null,
        startsAt: '2026-05-25',
        endsAt: '2026-05-26',
        category: 'Екологія та довкілля',
      },
      // Кризовий центр Надія
      {
        orgIdx: 2,
        title: 'Реабілітація ветеранів: IT-навички для нового старту',
        description:
          'Навчання ветеранів та ветеранок базових IT-навичок для полегшення повернення до мирного життя. Потрібні IT-фахівці як ментори.',
        type: InitiativeType.ONGOING,
        format: FormatType.ON_SITE,
        city: 'Дніпро',
        minAge: 21,
        requirements: 'Досвід роботи в IT від 2 років, терпіння та емпатія',
        startsAt: '2026-05-01',
        endsAt: '2026-12-31',
        category: 'Допомога ветеранам',
      },
      {
        orgIdx: 2,
        title: 'Група підтримки для сімей загиблих',
        description:
          'Ведення груп підтримки для сімей, що втратили рідних під час війни. Онлайн-формат для доступності з будь-якого міста.',
        type: InitiativeType.ONGOING,
        format: FormatType.REMOTE,
        city: null,
        minAge: 25,
        requirements:
          'Психологічна освіта або великий досвід волонтерства в кризових ситуаціях',
        startsAt: '2026-04-01',
        endsAt: null,
        category: 'Психологічна підтримка',
      },
      {
        orgIdx: 2,
        title: 'Термінова допомога притулку для тварин',
        description:
          'Термінова потреба волонтерів для допомоги переповненому притулку — годування, вигул, спілкування з тваринами.',
        type: InitiativeType.URGENT,
        format: FormatType.ON_SITE,
        city: 'Одеса',
        minAge: 16,
        requirements: null,
        startsAt: '2026-05-12',
        endsAt: '2026-06-30',
        category: 'Допомога тваринам',
      },
    ];

    const initiativeIds: string[] = [];
    for (const init of initiativeData) {
      const existing = await one(
        qr,
        `SELECT id FROM initiatives WHERE title = $1 AND organization_id = $2`,
        [init.title, orgIds[init.orgIdx]],
      );
      initiativeIds.push(
        existing
          ? existing.id
          : await insert(
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
            ),
      );
    }

    // ── Volunteers ────────────────────────────────────────────────────────────
    const volunteerData = [
      {
        email: 'olha.kovalchuk@gmail.com',
        firstName: 'Ольга',
        lastName: 'Ковальчук',
        city: 'Київ',
        age: 24,
        formatPreference: FormatPreference.ANY,
        bio: 'Студентка психологічного факультету, хочу допомагати людям у важкі часи.',
        interests: [
          'Психологічна підтримка',
          'Соціальна підтримка',
          'Допомога ветеранам',
        ],
      },
      {
        email: 'dmytro.petrenko@gmail.com',
        firstName: 'Дмитро',
        lastName: 'Петренко',
        city: 'Харків',
        age: 28,
        formatPreference: FormatPreference.ON_SITE,
        bio: 'Люблю активну роботу на свіжому повітрі. Маю досвід у лісовому господарстві.',
        interests: ['Екологія та довкілля', 'Гуманітарна допомога'],
      },
      {
        email: 'kateryna.bondar@gmail.com',
        firstName: 'Катерина',
        lastName: 'Бондар',
        city: 'Львів',
        age: 32,
        formatPreference: FormatPreference.REMOTE,
        bio: 'IT-розробниця. Хочу ділитися знаннями та допомагати ветеранам повернутися до мирного життя.',
        interests: [
          'IT та технології',
          'Освіта та наставництво',
          'Допомога ветеранам',
        ],
      },
      {
        email: 'mykola.savchenko@gmail.com',
        firstName: 'Микола',
        lastName: 'Савченко',
        city: 'Дніпро',
        age: 19,
        formatPreference: FormatPreference.ANY,
        bio: 'Студент медичного університету, хочу застосувати свої знання на практиці.',
        interests: [
          'Медична допомога',
          'Гуманітарна допомога',
          'Соціальна підтримка',
        ],
      },
      {
        email: 'anna.lysenko@gmail.com',
        firstName: 'Анна',
        lastName: 'Лисенко',
        city: 'Одеса',
        age: 22,
        formatPreference: FormatPreference.ANY,
        bio: 'Люблю тварин і природу. Регулярно допомагаю місцевому притулку для тварин.',
        interests: [
          'Допомога тваринам',
          'Екологія та довкілля',
          'Культура та мистецтво',
        ],
      },
    ];

    const volunteerProfileIds: string[] = [];
    for (const vol of volunteerData) {
      const existingVolUser = await one(
        qr,
        `SELECT id FROM users WHERE email = $1`,
        [vol.email],
      );
      const userId = existingVolUser
        ? existingVolUser.id
        : await insert(
            qr,
            `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
            [vol.email, passwordHash, UserRole.VOLUNTEER],
          );

      const existingProfile = await one(
        qr,
        `SELECT id FROM volunteer_profiles WHERE user_id = $1`,
        [userId],
      );
      const profileId = existingProfile
        ? existingProfile.id
        : await insert(
            qr,
            `INSERT INTO volunteer_profiles
               (first_name, last_name, city, age, format_preference, bio, user_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [
              vol.firstName,
              vol.lastName,
              vol.city,
              vol.age,
              vol.formatPreference,
              vol.bio,
              userId,
            ],
          );
      volunteerProfileIds.push(profileId);

      for (const interestName of vol.interests) {
        const catId = catIds[interestName];
        if (!catId) continue;
        const existingInterest = await one(
          qr,
          `SELECT id FROM volunteer_interests WHERE volunteer_profile_id = $1 AND category_id = $2`,
          [profileId, catId],
        );
        if (!existingInterest) {
          await qr.query(
            `INSERT INTO volunteer_interests (volunteer_profile_id, category_id) VALUES ($1, $2)`,
            [profileId, catId],
          );
        }
      }
    }

    // ── Applications ──────────────────────────────────────────────────────────
    // volIdx → initiativeIdx → status
    const applicationData: [number, number, ApplicationStatus][] = [
      [0, 0, ApplicationStatus.ACCEPTED],
      [0, 1, ApplicationStatus.PENDING],
      [0, 7, ApplicationStatus.PENDING],
      [1, 3, ApplicationStatus.ACCEPTED],
      [1, 5, ApplicationStatus.PENDING],
      [2, 4, ApplicationStatus.ACCEPTED],
      [2, 6, ApplicationStatus.PENDING],
      [3, 0, ApplicationStatus.REJECTED],
      [3, 2, ApplicationStatus.PENDING],
      [4, 8, ApplicationStatus.ACCEPTED],
    ];

    for (const [volIdx, initIdx, status] of applicationData) {
      const [existing] = await qr.query(
        `SELECT id FROM applications WHERE initiative_id = $1 AND volunteer_profile_id = $2`,
        [initiativeIds[initIdx], volunteerProfileIds[volIdx]],
      );
      if (!existing) {
        await qr.query(
          `INSERT INTO applications (initiative_id, volunteer_profile_id, status) VALUES ($1, $2, $3)`,
          [initiativeIds[initIdx], volunteerProfileIds[volIdx], status],
        );
      }
    }

    await qr.commitTransaction();
    console.log('Seed completed successfully');
    console.log('  Categories:', categoryNames.length);
    console.log('  Organizations:', orgData.length, '(+ 1 admin)');
    console.log('  Initiatives:', initiativeData.length);
    console.log('  Volunteers:', volunteerData.length);
    console.log('  Applications:', applicationData.length);
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

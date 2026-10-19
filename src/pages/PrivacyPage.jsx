import React from 'react'
import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = '2024-01-01'
const APP_NAME = 'Kolo Quest Kids'
const CONTACT_EMAIL = 'daniilkolomoets@gmail.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-violet-600 font-bold mb-8 hover:underline">
          ← Повернутися
        </Link>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">{APP_NAME}</h1>
          <h2 className="text-xl font-bold text-violet-600 mb-1">Політика конфіденційності</h2>
          <p className="text-sm text-gray-400 mb-8">Набирає чинності: {EFFECTIVE_DATE}</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">1. Загальні положення</h3>
              <p>
                {APP_NAME} ("ми", "додаток") — це сімейний додаток для відстеження завдань і нагород дітей.
                Ця Політика конфіденційності описує, які дані ми збираємо, як ми їх використовуємо і як захищаємо.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">2. Дані, які ми збираємо</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Батьки:</strong> email-адреса та пароль для входу (через Supabase Auth).</li>
                <li><strong>Діти:</strong> ім'я, логін та хешований пароль. Email дитини <em>не</em> вимагається і не зберігається.</li>
                <li><strong>Дані додатку:</strong> завдання, нагороди, бали — в межах сімейного акаунту.</li>
                <li><strong>Підписка:</strong> статус підписки обробляється через RevenueCat. Дані платіжної картки ми не отримуємо і не зберігаємо.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">3. Використання даних</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Автентифікація та безпека акаунту.</li>
                <li>Відображення завдань, балів і нагород у межах сім'ї.</li>
                <li>Надання та перевірка доступу до преміум-функцій.</li>
                <li>Ми <strong>не продаємо</strong> і не передаємо ваші дані третім особам у маркетингових цілях.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">4. Зберігання даних</h3>
              <p>
                Дані зберігаються на серверах <a href="https://supabase.com" className="text-violet-600 hover:underline" target="_blank" rel="noopener">Supabase</a> (PostgreSQL, EU-регіон).
                Паролі дітей зберігаються виключно у вигляді bcrypt-хешів — оригінальний пароль ніколи не зберігається.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">5. Діти та COPPA / GDPR-K</h3>
              <p>
                Додаток призначений для використання батьками разом з дітьми. Акаунти дітей створюються виключно
                батьківським акаунтом. Ми не збираємо email або особисту ідентифікаційну інформацію у дітей безпосередньо.
                Батьки мають повний контроль над даними дитини та можуть видалити акаунт дитини в будь-який час.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">6. Підписка та платежі</h3>
              <p>
                Платежі обробляються через <a href="https://www.revenuecat.com/privacy" className="text-violet-600 hover:underline" target="_blank" rel="noopener">RevenueCat</a> та
                відповідні платіжні платформи (Google Play Billing). Ми отримуємо лише статус підписки — без номера картки.
                Скасувати підписку можна в будь-який час через налаштування Google Play.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">7. Ваші права</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Право на доступ до своїх даних.</li>
                <li>Право на видалення акаунту та всіх пов'язаних даних.</li>
                <li>Право на виправлення неточних даних.</li>
              </ul>
              <p className="mt-2">Для будь-яких запитів щодо даних надішліть лист на: <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-600 hover:underline">{CONTACT_EMAIL}</a></p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">8. Cookies та аналітика</h3>
              <p>
                Ми не використовуємо рекламні трекери або аналітичні cookie третіх сторін.
                Supabase Auth використовує HttpOnly cookies для сесій.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">9. Зміни до цієї політики</h3>
              <p>
                Ми можемо оновлювати цю Політику. Про суттєві зміни повідомимо через додаток або email.
                Продовжуючи використовувати додаток, ви погоджуєтесь із поточною версією.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-gray-800 mb-2">10. Контакти</h3>
              <p>
                З питань конфіденційності зв'яжіться з нами:<br />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-600 hover:underline font-bold">{CONTACT_EMAIL}</a>
              </p>
            </section>

          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">© {new Date().getFullYear()} {APP_NAME}. Всі права захищені.</p>
      </div>
    </div>
  )
}

import React from 'react';
import { Container } from 'react-bootstrap';
import MainLayout from '../components/Layouts/MainLayout';
import styles from '../styles/guide.module.scss';

const Guide = () => (
  <MainLayout title="מדריך eSim" hideJumbotron>
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <h1 className="text-center p-2">הדרכה בנושאים שונים</h1>
        <div className="mt-4">
          <h2 className="mb-2">
            כיצד אוכל לדעת אם המכשיר שלי תומך בטכנולוגיית eSim?
          </h2>
          <p>
            ראשית, תוכלו לבדוק אם דגם מכשירכם נכלל ברשימת המכשירים התומכים
            בטכנולוגיית eSim, המפורסמת אצלנו באתר. עם זאת, מומלץ לבדוק את הגדרות
            המכשיר כדי לוודא שהמכשיר אכן תומך בטכנולוגיית eSim.
          </p>
          <h3 className="mt-3 mb-2">עבור מכשירי iPhone</h3>
          ראשית, מומלץ לבדוק שמכשירכם אינו נעול וניתן להחליף בו ספקית סלולר
          בקלות. כדי לבדוק זאת:
          <ol>
            <li>
              גשו להגדרות(Settings) -{'>'} כללי(General) -{'>'} אודות(About)
            </li>
            <li>
              גללו עד לתחתית המסך עד לחלק &quot;נעילת ספקים&quot;(Carrier Lock)
            </li>
            <li>
              אם חלק זה מציין שאין נעלת ספקים(No SIM restrictions), מכשירכם אינו
              נעול
            </li>
          </ol>
          <small>
            שימו לב: אם הטלפון שלכם נעול לספקים, לא תוכלו להחליף כרטיס סים לספק
            אחר או להשתמש בכרטיס eSim. תחילה עליכם לבטל את נעילת הספקים. לשם כך
            אנו ממליצים לפנות לספק המכשיר שלכם.
          </small>
          <h4 className="mt-3 mb-2">
            איך מוודאים שהטלפון תומך בטכנולוגיית eSim?
          </h4>
          <ol>
            <li>
              גשו להגדרות(Settings) -{'>'} סלולרי(Mobile Data) -{'>'} הוסף
              תוכנית סלולרית(Add Cellular Plan)
            </li>
            <li>במסך זה תוכלו לראות את כרטיסי הסים הפעילים במכשירכם</li>
            <li>
              לחצו על כפתור &quot;הוסף תוכנית סלולרית&quot;(Add Cellular Plan)
            </li>
            <li>
              אם תתבקשו לבחור באפשרות לסרוק קוד QR להפעלת הכרטיס, סימן שמכשירכם
              תומך בוודאות בטכנולוגיית eSim
            </li>
          </ol>
          <h3 className="mt-3 mb-2">עבור מכשירי Android</h3>
          <p>
            כדי לבדוק אם מכשיר האנדרואיד שלכם תומך ב-eSim עליכם לעקוב אחר מספר
            צעדים פשוטים שיפורטו מיד. עם זאת, חשוב להבין שכל חברה נוטה לשנות מעט
            את מערכת ההפעלה שהיא מציעה למשתמשיה ולפיכך יתכן גם שוני בתוויות שעל
            הכפתורים עליהם תצטרכו להקיש כדי לעקוב אחר הצעדים הבאים.
          </p>
          <h4 className="mt-3 mb-2">מכשירי Samsung</h4>
          <ol>
            <li>
              גשו להגדרות(Setting) -{'>'} חיבורים(Connections) -{'>'} מנהל כרטיס
              SIM(SIM Card Manager)
            </li>
            <li>
              אם האפשרות &quot;הוסף eSim&quot;(Add eSim) מופיעה על המסך, סימן
              שמכשירכם תומך בטכנולוגיית eSim.
            </li>
          </ol>
          <h3 className="mt-3 mb-2">
            אני לא בטוח אם המכשיר שלי תומך בטכנולוגיית eSim
          </h3>
          <p>
            אם אתם לא בטוחים אם המכשיר שלכם אכן תומך בטכנולוגיית eSim, או שפשוט
            תרצו לוודא זאת, אנו מזמינים אתכם ליצור קשר עם צוות התמיכה המנוסה
            שלנו.
          </p>
          <h2 className="mt-5 mb-2">כיצד מתקינים כרטיס eSim?</h2>
          <p>קיבלתם את קוד ה-QR של ה-eSim שלכם? זה הזמן להתקין אותו!</p>
          <h3 className="mt-3 mb-2">מכשירי iPhone</h3>
          <ol>
            <li>
              גשו להגדרות(Settings) -{'>'} סלולרי(Mobile Data) -{'>'} הוסף
              תוכנית סלולרית(Add Cellular Plan)
            </li>
            <li>במסך זה תוכלו לראות את כרטיסי הסים הפעילים במכשירכם</li>
            <li>
              לחצו על כפתור &quot;הוסף תוכנית סלולרית&quot;(Add Cellular Plan)
            </li>
            <li>בחרו באפשרות לסרוק קוד QR</li>
            <li>סירקו את קוד ה-QR</li>
          </ol>
          <h3 className="mt-3 mb-2">מכשירי Android</h3>
          <ol>
            <li>
              גשו להגדרות(Setting) -{'>'} חיבורים(Connections) -{'>'} מנהל כרטיס
              SIM(SIM Card Manager){' '}
            </li>
            <li>ליחצו על האפשרות הוספת eSim(Add eSim)</li>
            <li>
              לאחר מספר שניות יופיע לפניכם הכפתור &quot;סרוק קוד QR
              מספק&quot;(Scan QR from provider)
            </li>
            <li>סירקו את קוד ה-QR </li>
          </ol>
          <p className="mb-0">
            הסתבכתם? לא בטוחים מה לעשות? אל דאגה! צוות התמיכה המנוסה שלנו עומד
            לרשותכם וישמח לסייע לכם בכל עניין.
          </p>
        </div>
      </Container>
    </div>
  </MainLayout>
);

export default Guide;

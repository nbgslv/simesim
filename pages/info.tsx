import React from 'react';
import { Container } from 'react-bootstrap';
import MainLayout from '../components/Layouts/MainLayout';
import styles from '../styles/info.module.scss';

const Info = () => (
  <MainLayout hideJumbotron>
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <h1 className="text-center p-2">מה זה eSim?</h1>
        <div className="mt-3">
          <p>
            במהלך השנים עולם הסלולר עבר לא מעט מהפכות, החל ממסך המגע ועד לטעינה
            האלחוטית. החידוש האחרון הוא השימוש בכרטיס סים ווירטואלי. עם השנים
            גודלו קטן וקטן, וכעת – אנו לא זקוקים לו בכלל; כרטיס הסים, שמשמש
            לרישום המכשיר ברשת הסלולרית ומספק למכשיר הטלפון שלנו גישה לרשת
            הסלולר המקומית, ניתן כעת "להתקנה" פשוטה באמצעות סריקת קוד QR.
          </p>
          כרטיס eSim לחו"ל נרשם במכשירכם באותה הצורה הפשוטה, באמצעות 3 שלבים
          מהירים:
          <ol>
            <li>מזמינים חבילה</li>
            <li>מקבלים לאימייל מכתב עם קוד QR</li>
            <li>סורקים את הקוד ומפעילים את הכרטיס</li>
          </ol>
          <p>
            וזהו, זה כל מה שתצטרכו לעשות כדי להפעל כרטיס eSim לחו"ל. לאחר
            שתנחתו, ועוד במטוס, תוכלו לכבות באמצעות ההגדרות בטלפון את כרטיס הסים
            הרגיל שלכם, ולהפעיל את הכרטיס הווירטואלי.
          </p>
          <h2 className="mb-2">כרטיס eSim</h2>
          <p>
            השימוש בכרטיס eSim מתאפשר באמצעות טכנולוגיה פשוטה שמקודדת מספר
            מפתחות שמאפשרים את הזיהוי העצמאי של המכשיר ורישומו ברשת סלולרית. עם
            זאת, הטכנולוגייה לא קיימת בכל המכשירים הקיימים, ולכן, חשוב לוודא
            שמכשירכם תומך בטכנולוגיית eSim לפני רכישה של הכרטיס. בהמשך המאמר
            תמצאו מספר צעדים פשוטים שיאפשרו לכם לבדוק אם תוכלו להתקין כרטיס eSim
            לחו"ל במכשירכם ואם הוא תומך בטכנולוגיה הזו.
          </p>
          <p>
            כרטיס eSim היא טכנולוגייה חדשה שענקיות הסלולר הצהירו כבר כי ברצונן
            לאמץ. הגדילה לעשות אפל שהכריזה שמכשירה החדש מדגם 14 לא יכלול תושבת
            לכרטיס סים כלל, ויאלץ את משתמשיו לרכוש כרטיס סים וירטואלי. בנוסף,
            כרטיס eSim חוסך לכם את הצורך להמתין מספר ימים לקבלת כרטיס סים חדש,
            להחליפו בעת ההגעה לחו"ל, ושמירת הכרטיס המקומי שלכם כדי שתוכלו לחזור
            להשתמש בשיחות מקומיות כשתחזרו ארצה. במקום זאת, כרטיס eSim לחו"ל
            מאפשר לכם הפעלה פשוטה, באמצעות סריקת קוד QR, והפעלה וכיבוי מהירים.
          </p>
          <p className="mb-0">
            על כל כרטיס eSim ניתן להטעין חבילה אחת או יותר, בין אם עבור שיחות
            יוצאות/נכנסות ובין אם עבור גלישה. אנו מציעים מספר חבילות אטרקטיביות
            לגלישה בחו"ל, בכל רחבי העולם. הזמנתם חבילה והיא נגמרה? תוכלו להטעין
            חבילה נוספת בקלות ובמהירות, באמצעות האזור האישי שלכם באתר, ללא צורך
            בהמתנה לנציג.
          </p>
        </div>
      </Container>
    </div>
  </MainLayout>
);

export default Info;

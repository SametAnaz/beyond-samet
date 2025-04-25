// pages/contact.js
import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/Contact.module.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Şu anda bir API’ye gönderilmiyor; form verisini altta console’a yazıyoruz
    console.log("Gönderilen iletişim formu:", form);
    alert("Mesajınız alındı, teşekkürler!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Head>
        <title>İletişim – Beyond Samet</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>İletişim</h1>
        <p className={styles.lead}>
          Bana aşağıdaki formu doldurarak ulaşabilirsiniz. En kısa sürede dönüş yapacağım.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>İsim</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.field}>
            <span>E-posta</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Mesajınız</span>
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className={styles.button}>
            Gönder
          </button>
        </form>
      </main>
    </>
  );
}

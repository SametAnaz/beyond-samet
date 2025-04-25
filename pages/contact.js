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

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Mesajınız gönderildi! Teşekkürler.");
        setForm({ name: "", email: "", message: "" });
      } else {
        alert("Hata: " + data.message);
      }
    } catch {
      alert("Beklenmeyen bir hata oluştu.");
    }
  };

  return (
    <>
      <Head>
        <title>İletişim – Beyond Samet</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>İletişim</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>İsim</span>
            <input name="name" value={form.name} onChange={handleChange} required/>
          </label>
          <label className={styles.field}>
            <span>E-posta</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required/>
          </label>
          <label className={styles.field}>
            <span>Mesajınız</span>
            <textarea name="message" rows={5} value={form.message} onChange={handleChange} required/>
          </label>
          <button type="submit" className={styles.button}>Gönder</button>
        </form>
      </main>
    </>
  );
}

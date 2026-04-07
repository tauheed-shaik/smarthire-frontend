// src/components/ResumePDF.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Roboto" },
  title: { fontSize: 24, marginBottom: 10, color: "#4f46e5" },
  subtitle: { fontSize: 14, marginBottom: 5, color: "#6b7280" },
  section: { marginTop: 15 },
  text: { fontSize: 12, marginBottom: 3 },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  skill: { backgroundColor: "#e0e7ff", color: "#4f46e5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10 },
});

export default function ResumePDF({ resume }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{resume.name}</Text>
        <Text style={styles.subtitle}>{resume.appliedRole}</Text>
        <Text style={styles.text}>{resume.email} • {resume.phone}</Text>
        <Text style={styles.text}>{resumeresumes.location}</Text>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Skills</Text>
          <View style={styles.skills}>
            {resume.skills.map((skill) => (
              <Text key={skill} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Experience</Text>
          <Text style={styles.text}>{resume.experience} in software development</Text>
        </View>
      </Page>
    </Document>
  );
}
import streamlit as st
import re

st.title("Password Strength Analyzer")

password = st.text_input("Enter your password", type="password")

def check_password_strength(password):
    strength = 0
    remarks = []

    if len(password) >= 8:
        strength += 1
    else:
        remarks.append("Use at least 8 characters")

    if re.search(r"[A-Z]", password):
        strength += 1
    else:
        remarks.append("Add uppercase letters")

    if re.search(r"[a-z]", password):
        strength += 1
    else:
        remarks.append("Add lowercase letters")

    if re.search(r"[0-9]", password):
        strength += 1
    else:
        remarks.append("Add numbers")

    if re.search(r"[!@#$%^&*]", password):
        strength += 1
    else:
        remarks.append("Add special characters")

    if strength <= 2:
        return "Weak Password", remarks
    elif strength <= 4:
        return "Medium Password", remarks
    else:
        return "Strong Password", remarks

if password:
    result, remarks = check_password_strength(password)

    st.subheader(f"Strength: {result}")

    if remarks:
        st.write("Suggestions:")
        for r in remarks:
            st.write("-", r)

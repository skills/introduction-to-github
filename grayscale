import streamlit as st
import cv2
import numpy as np
from PIL import Image
import io

# Page Configuration
st.set_page_config(page_title="Image Grayscale Converter", page_icon="🖼", layout="centered")

# App Title
st.title("🖼 Image Upload & Grayscale Converter")

# Upload Image
uploaded_file = st.file_uploader("Upload an image (JPG, PNG)", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Convert uploaded image to OpenCV format
    image = Image.open(uploaded_file)
    image_np = np.array(image)

    # Convert to Grayscale
    gray_image = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

    # Convert back to PIL format for Streamlit display
    gray_pil = Image.fromarray(gray_image)

    # Display Original & Grayscale Images
    col1, col2 = st.columns(2)

    with col1:
        st.image(image, caption="Original Image", use_container_width=True)

    with col2:
        st.image(gray_pil, caption="Grayscale Image", use_container_width=True)

    # Convert grayscale image to bytes for download
    buf = io.BytesIO()
    gray_pil.save(buf, format="PNG")
    byte_im = buf.getvalue()

    # Download Button for Grayscale Image
    st.download_button(
        label="📥 Download Grayscale Image",
        data=byte_im,
        file_name="grayscale_image.png",
        mime="image/png"
    )

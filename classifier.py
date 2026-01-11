import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import os
import logging

logger = logging.getLogger(__name__)

class ImageClassifier:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load MobileNetV2 pre-trained model and add classification head"""
        try:
            base_model = keras.applications.MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights='imagenet'
            )
            base_model.trainable = False
            
            # Add classification head for binary classification (Animal vs Person)
            inputs = keras.Input(shape=(224, 224, 3))
            x = base_model(inputs, training=False)
            x = keras.layers.GlobalAveragePooling2D()(x)
            x = keras.layers.Dropout(0.2)(x)
            outputs = keras.layers.Dense(2, activation='softmax')(x)
            
            self.model = keras.Model(inputs, outputs)
            
            # Load weights if available, otherwise use random weights
            weights_path = "ml/classifier_weights.h5"
            if os.path.exists(weights_path):
                self.model.load_weights(weights_path)
                logger.info("Loaded classifier weights from file")
            else:
                # Initialize with random weights for demo
                logger.warning("No weights file found, using random initialization")
                self.model.compile(
                    optimizer='adam',
                    loss='sparse_categorical_crossentropy',
                    metrics=['accuracy']
                )
            
            logger.info("Classifier model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading classifier: {e}")
            raise
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for MobileNetV2"""
        try:
            img = Image.open(image_path).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = keras.applications.mobilenet_v2.preprocess_input(img_array)
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def classify(self, image_path: str) -> tuple[str, float]:
        """
        Classify image as Animal or Person
        Returns: (classification, confidence)
        """
        try:
            processed_img = self.preprocess_image(image_path)
            predictions = self.model.predict(processed_img, verbose=0)
            
            # Binary classification: [Animal, Person]
            classes = ["Animal", "Person"]
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            classification = classes[predicted_class_idx]
            
            return classification, confidence
        except Exception as e:
            logger.error(f"Error classifying image: {e}")
            raise Exception(f"Classification failed: {str(e)}")

# Global classifier instance
classifier = None

def get_classifier():
    global classifier
    if classifier is None:
        classifier = ImageClassifier()
    return classifier

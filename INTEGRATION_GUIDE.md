# NEUROOO Mental Health Analysis Integration Guide

This guide explains how to set up and use the integrated DeepFace and Mistral AI system for comprehensive mental health analysis in your NEUROOO app.

## 🎯 Overview

The system integrates:
- **DeepFace**: For facial emotion analysis and stress detection
- **Mistral AI**: For AI-powered mental health insights and interventions
- **FastAPI Backend**: RESTful API for processing and analysis
- **React Native Frontend**: Enhanced UI with mental health metrics

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
python setup.py

# Or manually install requirements
pip install -r requirements.txt

# Run the server
python run_server.py
```

### 2. Frontend Configuration

Update your frontend to use the new backend endpoints:

```typescript
// In your FacialAnalysisScreen.tsx
const response = await fetch('http://localhost:8000/emotion/analyze', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});
```

## 🔧 Backend Features

### DeepFace Integration

The backend uses DeepFace for:
- **Emotion Detection**: 7 basic emotions (happy, sad, angry, fear, surprise, disgust, neutral)
- **Stress Level Calculation**: Based on negative emotions
- **Mental Health Scoring**: 0-100 scale based on emotional balance

### Mistral AI Integration

Mistral AI provides:
- **Personalized Insights**: Context-aware analysis
- **Mental Health Recommendations**: Tailored interventions
- **Emergency Alerts**: Crisis detection and contact information
- **Text Analysis**: Mental health assessment from text input

### API Endpoints

#### 1. Facial Emotion Analysis
```http
POST /emotion/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: image file
- context: optional text context
```

**Response:**
```json
{
  "primary_emotion": "sad",
  "confidence": 85.2,
  "emotions": [
    {"name": "sad", "score": 85.2, "color": "#EF4444"},
    {"name": "neutral", "score": 10.1, "color": "#6B7280"}
  ],
  "stress_level": 75,
  "mental_health_score": 35,
  "insights": ["Your facial expression indicates sadness", "High stress levels detected"],
  "recommendations": ["Try deep breathing exercises", "Consider talking to someone"]
}
```

#### 2. Mental Health Analysis
```http
POST /mental-health/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: image file
- context: optional text context
```

**Response:**
```json
{
  "stress_level": 75,
  "anxiety_level": 80,
  "depression_risk": "Moderate",
  "overall_mood": "Concerning",
  "mental_health_score": 35,
  "insights": ["High stress and anxiety detected", "Consider professional help"],
  "interventions": ["Practice mindfulness", "Seek professional counseling"],
  "emergency_contact": "National Suicide Prevention Lifeline: 988"
}
```

#### 3. Text Analysis
```http
POST /mental-health/analyze/text
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer <token>

Body:
- content: text to analyze
- context: optional context
```

## 📱 Frontend Enhancements

### New Features Added

1. **Mental Health Metrics Dashboard**
   - Stress level visualization
   - Mental health score tracking
   - Color-coded indicators

2. **AI-Powered Insights**
   - Personalized recommendations
   - Context-aware analysis
   - Emergency contact alerts

3. **Enhanced History**
   - Stress level tracking over time
   - Mental health score progression
   - Quick access to previous analyses

4. **Context Input**
   - Optional text context for better analysis
   - Improved AI recommendations

### UI Components

#### Mental Health Metrics
```typescript
<View style={styles.metricsContainer}>
  <Text style={styles.metricsTitle}>Mental Health Metrics</Text>
  <View style={styles.metricsGrid}>
    <View style={styles.metricCard}>
      <Activity size={24} color={getStressLevelColor(stressLevel)} />
      <Text style={styles.metricValue}>{stressLevel}%</Text>
      <Text style={styles.metricLabel}>Stress Level</Text>
    </View>
    <View style={styles.metricCard}>
      <Heart size={24} color={getMentalHealthColor(mentalHealthScore)} />
      <Text style={styles.metricValue}>{mentalHealthScore}%</Text>
      <Text style={styles.metricLabel}>Mental Health Score</Text>
    </View>
  </View>
</View>
```

#### AI Insights
```typescript
<View style={styles.insightsContainer}>
  <Text style={styles.insightsTitle}>
    <Lightbulb size={20} color="#F59E0B" />
    AI Insights
  </Text>
  {insights.map((insight, index) => (
    <View key={index} style={styles.insightItem}>
      <Zap size={16} color="#F59E0B" />
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  ))}
</View>
```

## 🧠 Mental Health Scoring System

### Stress Level (0-100)
- **0-30**: Low stress (Green)
- **31-60**: Moderate stress (Yellow)
- **61-100**: High stress (Red)

**Calculation**: Based on negative emotions (angry, disgust, fear, sad)

### Mental Health Score (0-100)
- **0-30**: Concerning (Red) - Emergency contact shown
- **31-60**: Moderate (Yellow) - Recommendations provided
- **61-100**: Good (Green) - Positive reinforcement

**Calculation**: Positive emotions - negative emotions + baseline

### Depression Risk Assessment
- **Low**: Mental health score > 60, low sadness
- **Moderate**: Mental health score 30-60, moderate sadness
- **High**: Mental health score < 30, high sadness

## 🔒 Security & Privacy

### Authentication
- Bearer token required for all endpoints
- Token validation (implement your own auth system)

### Data Handling
- Images processed temporarily and deleted
- No permanent storage of sensitive data
- Secure API communication

### Emergency Protocols
- Automatic detection of concerning mental health scores
- Emergency contact information provided
- Crisis intervention recommendations

## 🛠️ Configuration

### Environment Variables
```bash
HF_TOKEN=your_huggingface_token
MISTRAL_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### DeepFace Settings
```python
DEEPFACE_MODELS = ['emotion']
DEEPFACE_DETECTOR_BACKEND = 'opencv'
```

### Mental Health Thresholds
```python
HIGH_STRESS_THRESHOLD = 70
MODERATE_STRESS_THRESHOLD = 40
LOW_MENTAL_HEALTH_THRESHOLD = 30
MODERATE_MENTAL_HEALTH_THRESHOLD = 50
```

## 📊 Monitoring & Analytics

### Backend Logging
- Request/response logging
- Error tracking
- Performance metrics

### Mental Health Trends
- Historical analysis tracking
- Progress monitoring
- Intervention effectiveness

## 🚨 Emergency Features

### Crisis Detection
- Automatic detection of concerning scores
- Emergency contact display
- Crisis intervention recommendations

### Emergency Contacts
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Local emergency services

## 🔄 Integration Workflow

1. **User uploads photo** → Frontend sends to backend
2. **DeepFace analyzes emotions** → Extracts emotion scores
3. **Calculate mental health metrics** → Stress level, mental health score
4. **Mistral AI generates insights** → Personalized recommendations
5. **Return comprehensive analysis** → Frontend displays results
6. **Store in history** → Track progress over time

## 🎨 Customization

### UI Customization
- Color schemes for different mental health levels
- Custom icons and animations
- Branded styling

### Analysis Customization
- Adjustable thresholds
- Custom emotion weights
- Personalized recommendations

### Integration Points
- Connect to existing mental health apps
- Export data to healthcare providers
- Integration with wellness platforms

## 🐛 Troubleshooting

### Common Issues

1. **DeepFace Installation**
   ```bash
   pip install deepface --upgrade
   ```

2. **CUDA/GPU Issues**
   ```bash
   pip install tensorflow-cpu
   ```

3. **API Connection**
   - Check server is running
   - Verify CORS settings
   - Check authentication tokens

4. **Memory Issues**
   - Reduce image quality
   - Implement image compression
   - Use smaller models

## 📈 Future Enhancements

### Planned Features
- Voice emotion analysis
- Real-time video analysis
- Machine learning model training
- Integration with wearable devices
- Telemedicine integration

### Advanced Analytics
- Predictive mental health modeling
- Trend analysis and forecasting
- Personalized intervention plans
- Progress tracking and reporting

## 🤝 Support

For technical support or questions:
- Check the backend logs for errors
- Verify all dependencies are installed
- Ensure proper API configuration
- Test with sample images first

---

**Note**: This system is designed for mental health support and should not replace professional medical advice. Always encourage users to seek professional help when needed. 
# AudCog Online - Auditory Cognitive Assessment Platform

A comprehensive web-based platform for conducting auditory cognitive assessments and research studies. Built with vanilla HTML, CSS, JavaScript, and Firebase, this application provides a suite of standardized auditory tests designed to evaluate speech perception, working memory, and musical abilities.

## 🎯 Overview

AudCog Online is a research-grade auditory assessment platform developed at Newcastle University. The platform includes multiple validated cognitive tests designed to understand the relationship between hearing ability and dementia risk. The application is optimized for research studies and provides a complete workflow from participant consent to data collection.

## 🔬 Research Background

This platform is part of ongoing research investigating the link between hearing ability and dementia risk. The study has been approved by the Oxford C NHS Research Ethics Committee and is sponsored by the Newcastle University Hospitals NHS Foundation Trust.

## 🧪 Assessment Modules

### 1. **Speech-in-Babble (SIB) Task**
- **Purpose**: Tests speech perception in multi-talker babble
- **Method**: Adaptive 1-up, 1-down paradigm
- **Stimuli**: 5-word sentences with structure `<NAME><VERB><NUMBER><ADJ><NOUN>`
- **Background**: 3-talker babble with Southern English accent
- **Threshold**: 50% calculated from last 6 reversals (stops after 10 reversals)
- **Reference**: Holmes and Griffiths. Sci Reports. 2019

### 2. **Digits-in-Noise (DIN) Task**
- **Purpose**: Tests digit recognition in speech-shaped noise
- **Method**: Adaptive 1-up, 1-down paradigm
- **Stimuli**: 3-digit sequences
- **Background**: Speech-shaped white noise
- **Threshold**: 50% calculated from last 6 reversals (stops after 10 reversals)
- **Reference**: De Sousa et al. Ear and Hearing. 2019

### 3. **Auditory Working Memory (AWM) Task**
- **Purpose**: Tests precision of pure-tone retention in working memory
- **Method**: Retro-cue paradigm with visual analog scale response
- **Stimuli**: Pure tones (440-880 Hz) with auditory masker during delay
- **Load**: 1 or 2 tones held in memory
- **Trials**: 32 experimental trials + 4 practice trials
- **Reference**: Lad et al. Sci Reports. 2020

### 4. **Gold-MSI Questionnaire**
- **Purpose**: Assesses musical sophistication and abilities
- **Structure**: 39 questions across 7 subscales
- **Subscales**: 
  - Active Engagement (AE)
  - Emotional Contagion (EM)
  - Musical Training (MT)
  - Perceptual Abilities (PA)
  - Singing Abilities (SA)
  - Absolute Pitch (AP)
- **Response**: 7-point Likert scale

## 🏗️ Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Bootstrap 4.4.1 for responsive design
- **JavaScript (ES6+)**: Vanilla JS for core functionality
- **p5.js**: Creative coding library for audio/visual interactions
- **jQuery**: DOM manipulation and AJAX requests
- **Plotly.js**: Data visualization and results charts

### Backend & Data
- **Firebase**: 
  - Authentication (Anonymous)
  - Realtime Database
  - Analytics
- **Audio Processing**: Web Audio API via p5.sound.js
- **Statistics**: Simple Statistics library for data analysis

### Audio Assets
- **Format**: FLAC files for high-quality audio
- **Content**: 144 sentence stimuli for SIB task
- **Speakers**: Multiple talkers with Southern English accent
- **Structure**: Organized by speaker (Thomas, William, Lucy, Nina, Peter)

## 📁 Project Structure

```
public/
├── index.html              # Main application entry point
├── js/                     # JavaScript modules
│   ├── main.js            # Application initialization & routing
│   ├── controller.js      # Task controller & UI components
│   ├── sib.js            # Speech-in-Babble task implementation
│   ├── din.js            # Digits-in-Noise task implementation
│   ├── awm.js            # Auditory Working Memory task
│   ├── gmsi.js           # Gold-MSI questionnaire
│   ├── headphonesCheck.js # Audio calibration & validation
│   └── dash.js           # Results dashboard
├── static/
│   ├── audio/            # Audio stimuli (FLAC files)
│   ├── videos/           # Instructional videos
│   ├── images/           # UI assets and logos
│   └── main.css          # Application styling
└── *.html                # Individual task pages
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome recommended)
- Headphones for accurate audio testing
- Firebase project setup
- Minimum screen resolution: 1000x500 pixels

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/meherlad/audcog-online.git
   cd audcog-online
   ```

2. **Firebase Setup**:
   - Create a Firebase project
   - Update Firebase configuration in `public/js/main.js`
   - Configure Realtime Database rules in `database.rules.json`

3. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy
   ```

### Usage

1. **Participant Access**: 
   - Navigate to `https://your-project.firebaseapp.com?userID=PARTICIPANT_ID`
   - Replace `PARTICIPANT_ID` with unique participant identifier

2. **Debug Mode**:
   - Use `?userID=debug` for testing individual tasks
   - Use `?userID=demo` for demonstration mode

3. **Data Collection**:
   - All responses are automatically stored in Firebase Realtime Database
   - Data structure: `audcog-online/{userID}/sessions/{sessionData}`

## 📊 Data Structure

### Participant Data
```json
{
  "userID": {
    "sessions": 1,
    "demographics": {
      "age": "25",
      "sex": "Female",
      "device": "Laptop",
      "headphones": "Over-ear headphones",
      "hearing_aids": "No",
      "comments": "User feedback"
    },
    "timings": {
      "expStartTime": "1430",
      "expFinishTime": "1520",
      "sibStartTime": "1435",
      "sibFinishTime": "1450"
    }
  }
}
```

### Task Results
Each task stores specific metrics:
- **SIB**: Threshold levels, reversals, response times
- **DIN**: Threshold levels, reversals, response times  
- **AWM**: Precision scores, trial data, response errors
- **GMSI**: Questionnaire responses, subscale scores

## 🔒 Security & Privacy

- **Anonymous Authentication**: No personal identifiers required
- **Data Encryption**: Firebase provides secure data transmission
- **Ethics Compliance**: Study approved by NHS Research Ethics Committee
- **Participant Rights**: Right to withdraw at any time
- **Data Protection**: GDPR compliant data handling

## 🎧 Audio Requirements

### Hardware
- **Headphones**: Over-ear or in-ear headphones recommended
- **Audio Interface**: Built-in or external sound card
- **Volume Control**: Participant-adjustable volume

### Calibration
- **Headphones Check**: Built-in audio calibration routine
- **Volume Guidelines**: Start low, adjust to comfort
- **Browser Compatibility**: Chrome recommended for best audio performance

## 📱 Browser Compatibility

- **Primary**: Google Chrome (recommended)
- **Secondary**: Firefox, Edge, Safari
- **Mobile**: Limited support (desktop recommended)
- **Screen Size**: Minimum 1000x500 pixels

## 🧪 Research Applications

### Current Studies
- **PREVENT Study**: Investigating hearing-dementia relationship
- **Longitudinal Assessment**: Multiple session tracking
- **Population Studies**: Large-scale data collection

### Data Analysis
- **Threshold Calculation**: Adaptive staircase algorithms
- **Statistical Analysis**: Built-in statistical functions
- **Export Capabilities**: Firebase data export for analysis

## 👥 Development Team

- **Principal Investigator**: Dr. Meher Lad (Newcastle University)
- **Institution**: Newcastle University Hospitals NHS Foundation Trust
- **Contact**: audcog@ncl.ac.uk

## 📄 License & Ethics

- **Research Use**: Approved for research purposes only
- **Ethics Approval**: Oxford C NHS Research Ethics Committee
- **Data Sharing**: Contact research team for collaboration
- **Commercial Use**: Not licensed for commercial applications

## 🤝 Contributing

This is a research platform. For collaboration or modifications:
1. Contact the research team at audcog@ncl.ac.uk
2. Ensure compliance with research ethics requirements
3. Maintain data security and participant privacy standards

## 📞 Support

For technical support or research inquiries:
- **Email**: audcog@ncl.ac.uk
- **Institution**: Newcastle University
- **Study Website**: [Research Information]

---

*This platform is designed for research purposes and should be used in accordance with approved research protocols.*

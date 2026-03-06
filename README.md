# AI-Powered Smart Evacuation System (Digital Twin & IoT)

### **Project Overview**

This project is a **Cyber-Physical System (CPS)** designed for real-time fire detection and intelligent evacuation routing. It combines physical IoT hardware with a sophisticated React-based "Digital Twin" dashboard. The system utilizes the **A* Pathfinding Algorithm** to calculate the safest exit routes dynamically, based on the specific location of a fire hazard.

---

## 🚀 Key Features

* **Dual-Mode Operation:** * **Live Mode:** Real-time data streaming from physical ESP32 sensor nodes.
* **Simulation Mode:** A "Digital Twin" engine that simulates thermal thresholds and smoke spread to test algorithm behavior without hardware.


* **Intelligent Pathfinding:** Implements the **A* Algorithm** on a building graph to bypass blocked stairwells and hazardous zones.
* **Multimodal Visualization:**
* **3D Isometric View:** A transparent architectural render showing floor-wise danger levels.
* **2D Tactical Blueprint:** A high-fidelity SVG CAD layout showing flat subdivisions, elevators, and animated evacuation flows.


* **Voice Commands:** Automated Hindi emergency announcements using the Web Speech API for localized accessibility.
* **Historical Telemetry:** Real-time line charts tracking Temperature and Raw Gas (MQ2) levels.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React.js, Tailwind CSS, Three.js (@react-three/fiber), Chart.js, Lucide React |
| **Backend** | Python Flask, Flask-CORS |
| **Algorithm** | A* Pathfinding (Heuristic-based) |
| **Hardware** | ESP32, MQ2 Gas Sensor, DHT11 Temp Sensor, I2C LCD, Piezo Buzzer |
| **Communication** | HTTP/REST API (JSON over Wi-Fi) |

---

## 📂 Project Structure

```text
├── backend/
│   └── app.py              # Flask server & A* Algorithm logic
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main Dashboard & 2D Blueprint logic
│   │   ├── BuildingMap.jsx # 3D Isometric Three.js visualization
│   │   └── main.jsx
│   └── tailwind.config.js
└── hardware/
    ├── sensor_node.ino     # ESP32 code for DHT11/MQ2
    └── alarm_node.ino      # ESP32 code for LCD/Buzzer

```

---

## ⚙️ Setup & Installation

### 1. Backend Setup

1. Navigate to the `backend` folder.
2. Install dependencies: `pip install flask flask-cors`.
3. Run the server: `python app.py`.
* *Note: The server runs on `http://0.0.0.0:5000` to allow hardware connections.*



### 2. Frontend Setup

1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Run the dashboard: `npm run dev`.

### 3. Hardware Integration

1. Connect your ESP32 and Laptop to the same mobile hotspot (**iQOO Z6 5G**).
2. Ensure your laptop's IPv4 address matches the one hardcoded in the ESP32 (`10.231.125.119`).
3. Switch the Dashboard to **Live Mode**.

---

## 🧠 Simulation Logic

The system includes a **Simulation Override Center**. When a specific flat is ignited:

1. The **Digital Twin** generates organic raw analog data.
2. The **A* Algorithm** calculates a route that prioritizes unblocked stairwells.
3. The **2D Map** renders a dashed-line animation showing the flow from the room to the exit.
4. **Voice Feedback** triggers in Hindi to provide clear instructions to occupants.

Here is a professional **Conclusion** and **Future Scope** section you can include in your final project report and your README. These sections demonstrate to the evaluators that you understand the real-world impact and the scalability of your engineering work.

---

## 🏁 Conclusion

The **AI-Powered Smart Evacuation System** successfully demonstrates the integration of IoT hardware with advanced pathfinding algorithms to solve a critical safety challenge. By moveing away from "static" exit signs to "dynamic" real-time routing, the project addresses the primary cause of fire-related fatalities: confusion and hazardous route selection.

The implementation of a **Digital Twin** via the React dashboard ensures that building managers have total visibility, while the **A* Algorithm** ensures that occupants are always directed away from smoke and heat. This project proves that low-cost hardware (ESP32) combined with modern web technologies can create a life-saving infrastructure capable of high precision and localized accessibility.

---

## 🔮 Future Scope

While the current prototype is a robust proof-of-concept, the following enhancements could transition this system into a commercial-grade smart building solution:

* **Multi-Sensor Fusion:** Incorporating CO2, Heat, and Flame sensors simultaneously to reduce false alarms and increase detection accuracy.
* **Mobile App Integration:** Developing a Flutter/React Native app that provides haptic feedback and turn-by-turn navigation on the user's smartphone during an evacuation.
* **Occupancy Mapping:** Using PIR or IR sensors to detect the number of people in a room, allowing the A* algorithm to prioritize routes for more crowded areas.
* **Predictive AI (ML):** Implementing LSTM (Long Short-Term Memory) networks to predict fire spread patterns based on building materials and ventilation data.
* **LiFi/LoRaWAN Support:** Moving beyond Wi-Fi to LoRaWAN to ensure the system remains operational even if the building's primary internet or power grid fails.

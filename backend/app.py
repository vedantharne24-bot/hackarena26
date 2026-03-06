from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import heapq

app = Flask(__name__)
# Enable CORS so your React frontend can communicate with Flask securely
CORS(app)

# ==========================================
# 1. A* PATHFINDING ALGORITHM SETUP
# ==========================================
building_graph = {
    'floor_4': {'stair_a_4': 1, 'stair_b_4': 1},
    'stair_a_4': {'stair_a_3': 1},
    'stair_b_4': {'stair_b_3': 1},
    'floor_3': {'stair_a_3': 1, 'stair_b_3': 1},
    'stair_a_3': {'stair_a_2': 1},
    'stair_b_3': {'stair_b_2': 1},
    'floor_2': {'stair_a_2': 1, 'stair_b_2': 1},
    'stair_a_2': {'stair_a_1': 1},
    'stair_b_2': {'stair_b_1': 1},
    'floor_1': {'main_lobby': 1},
    'stair_a_1': {'main_lobby': 1},
    'stair_b_1': {'main_lobby': 1},
    'main_lobby': {'safe_zone': 1},
    'safe_zone': {}
}

def heuristic(node):
    h_values = {
        'floor_4': 5, 'stair_a_4': 4, 'stair_b_4': 4,
        'floor_3': 4, 'stair_a_3': 3, 'stair_b_3': 3,
        'floor_2': 3, 'stair_a_2': 2, 'stair_b_2': 2,
        'floor_1': 2, 'stair_a_1': 1, 'stair_b_1': 1,
        'main_lobby': 1, 'safe_zone': 0
    }
    return h_values.get(node, 10)

def a_star_search(start, goal, blocked_nodes):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {node: float('inf') for node in building_graph}
    g_score[start] = 0

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for neighbor in building_graph.get(current, {}):
            if neighbor in blocked_nodes:
                continue
            tentative_g = g_score[current] + building_graph[current][neighbor]
            if tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor)
                heapq.heappush(open_set, (f_score, neighbor))
    return None

# ==========================================
# 2. SELECTIVE EVACUATION LOGIC
# ==========================================
def generate_dynamic_routes(fire_location):
    try:
        fire_floor_num = int(fire_location.split('_')[1])
    except:
        fire_floor_num = 0

    # Block the staircase closest to the fire to simulate smoke spread
    blocked = [fire_location, f'stair_b_{fire_floor_num}']
    
    routes = {}
    for floor_str in ['floor_1', 'floor_2', 'floor_3', 'floor_4']:
        current_floor_num = int(floor_str.split('_')[1])
        
        # Only evacuate the fire floor and the one directly above it
        if current_floor_num == fire_floor_num:
            status_prefix = "IMMEDIATE DANGER: "
        elif current_floor_num == fire_floor_num + 1:
            status_prefix = "HIGH RISK (SMOKE): "
        else:
            routes[floor_str] = "STANDBY: Stay in place. Keep staircases clear."
            continue

        path = a_star_search(floor_str, 'safe_zone', blocked)
        if path:
            if len(path) > 1 and 'stair_a' in path[1]:
                routes[floor_str] = f"{status_prefix}Evacuate via STAIRCASE A."
            elif len(path) > 1 and 'stair_b' in path[1]:
                routes[floor_str] = f"{status_prefix}Evacuate via STAIRCASE B."
            else:
                routes[floor_str] = f"{status_prefix}Proceed to MAIN LOBBY."
        else:
            routes[floor_str] = "TRAPPED: Safe path blocked. Seal doors."
            
    return routes

# ==========================================
# 3. CENTRAL STATE (MOCK DATABASE)
# ==========================================
building_state = {
    "status": "online",
    "fire_active": False,
    "fire_location": None,
    "latest_sensor_data": {"temperature": 24.0, "smoke_level": 300.0}, # 300 is a normal raw MQ2 value
    "evacuation_routes": {
        "floor_1": "Safe. Monitoring.",
        "floor_2": "Safe. Monitoring.",
        "floor_3": "Safe. Monitoring.",
        "floor_4": "Safe. Monitoring."
    },
    "logs": [] 
}

def add_log(event_type, message):
    current_time = datetime.now().strftime("%H:%M:%S")
    building_state["logs"].insert(0, {"time": current_time, "type": event_type, "message": message})
    if len(building_state["logs"]) > 50: building_state["logs"].pop()

# ==========================================
# 4. LEGACY ESP32 HARDWARE ADAPTER ROUTES
# ==========================================

# Catch the ESP32 Sensor GET request (e.g., /data?smoke=1600&temp=31.5&fire=1)
@app.route('/data', methods=['GET'])
def legacy_sensor_data():
    global building_state
    
    # Read EXACT URL parameters sent by ESP32, default to current state if missing
    temp = request.args.get('temp', default=building_state["latest_sensor_data"]["temperature"], type=float)
    smoke_raw = request.args.get('smoke', default=building_state["latest_sensor_data"]["smoke_level"], type=float)
    fire_alert = request.args.get('fire', default=0, type=int)
    
    # Pass the EXACT raw values directly to the React Dashboard
    building_state["latest_sensor_data"]["temperature"] = temp
    building_state["latest_sensor_data"]["smoke_level"] = smoke_raw
    
    # Trigger system based on ESP32's internal fire logic
    if fire_alert == 1 and not building_state["fire_active"]:
        building_state["fire_active"] = True
        building_state["fire_location"] = "floor_3" # Assuming your ESP32 is acting as Floor 3
        add_log("CRITICAL", f"HARDWARE TRIGGER: Temp: {temp}C, Smoke Raw: {smoke_raw}")
        building_state["evacuation_routes"] = generate_dynamic_routes("floor_3")
        
    # Auto reset if ESP32 says fire is gone
    elif fire_alert == 0 and building_state["fire_active"]:
        building_state["fire_active"] = False
        building_state["fire_location"] = None
        building_state["evacuation_routes"] = {f"floor_{i}": "Safe. Monitoring." for i in range(1, 5)}
        add_log("INFO", "Hardware reports environment clear. Auto-resetting.")

    return jsonify({"message": "Hardware Exact Data Synced"}), 200

# Catch the ESP32 LCD/Alarm request
@app.route('/', methods=['GET'])
def legacy_alarm_status():
    global building_state
    
    if building_state["fire_active"]:
        # LCD is 16x2. We must keep this message extremely short.
        instruction = building_state["evacuation_routes"].get("floor_3", "")
        short_msg = "EVACUATE STAIR A" if "STAIRCASE A" in instruction else "EVACUATE STAIR B"
        return jsonify({
            "fire": 1,
            "message": short_msg
        })
    else:
        return jsonify({
            "fire": 0,
            "message": "System Normal  "
        })

# ==========================================
# 5. REACT DASHBOARD / SIMULATION ROUTES
# ==========================================

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": building_state["status"],
        "fire_active": building_state["fire_active"],
        "fire_location": building_state["fire_location"],
        "sensors": building_state["latest_sensor_data"],
        "logs": building_state["logs"]
    }), 200

# Endpoint for the React Digital Twin (POST JSON)
@app.route('/api/sensor/data', methods=['POST'])
def receive_react_sensor_data():
    global building_state
    data = request.get_json()
    
    real_temp = float(data.get("temperature", 24.0))
    real_smoke = float(data.get("smoke_level", 300.0))
    floor_id = data.get("floor_id", "floor_2") 
    
    building_state["latest_sensor_data"]["temperature"] = real_temp
    building_state["latest_sensor_data"]["smoke_level"] = real_smoke
    
    # Simulation thresholds (matches ESP32 rough logic)
    if (real_temp > 60 or real_smoke > 1500) and not building_state["fire_active"]:
        building_state["fire_active"] = True
        building_state["fire_location"] = floor_id 
        add_log("CRITICAL", f"SIMULATION TRIGGER on {floor_id}. Initiating A* evacuation.")
        building_state["evacuation_routes"] = generate_dynamic_routes(floor_id)
        
    elif (real_temp < 40 and real_smoke < 800) and building_state["fire_active"]:
        building_state["fire_active"] = False
        building_state["fire_location"] = None
        building_state["evacuation_routes"] = {f"floor_{i}": "Safe. Monitoring." for i in range(1, 5)}
        add_log("INFO", "Simulated environment normalized. Auto-resetting protocol.")
        
    return jsonify({"message": "Sim Data Processed"}), 200

@app.route('/api/evacuation/<floor_id>', methods=['GET'])
def get_evacuation_route(floor_id):
    if floor_id in building_state["evacuation_routes"]:
        return jsonify({
            "floor": floor_id,
            "instruction": building_state["evacuation_routes"][floor_id],
            "fire_active": building_state["fire_active"]
        }), 200
    return jsonify({"error": "Floor not found."}), 404

@app.route('/api/sensor/fire', methods=['POST'])
def trigger_fire_alarm():
    global building_state
    data = request.get_json()
    fire_floor = data.get("floor_id")
    
    if not building_state["fire_active"]:
        building_state["fire_active"] = True
        building_state["fire_location"] = fire_floor
        add_log("WARNING", f"MANUAL ALARM OVERRIDE: {fire_floor}. Priority evacuation initiated.")
        building_state["evacuation_routes"] = generate_dynamic_routes(fire_floor)
    
    return jsonify({"status": "alert_received"}), 200

@app.route('/api/system/reset', methods=['POST'])
def reset_system():
    global building_state
    building_state["fire_active"] = False
    building_state["fire_location"] = None
    building_state["latest_sensor_data"] = {"temperature": 24.0, "smoke_level": 300.0}
    building_state["evacuation_routes"] = {f"floor_{i}": "Safe. Monitoring." for i in range(1, 5)}
    add_log("INFO", "System reset by Command Center. All zones returned to Standby.")
    return jsonify({"message": "Reset successful"}), 200

if __name__ == '__main__':
    # host='0.0.0.0' exposes the server to your local Wi-Fi, allowing the ESP32 to connect!
    app.run(debug=True, host='0.0.0.0', port=5000)
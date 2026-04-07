# =============================================================================
# utils/network_simulator.py
# Network Simulation Layer
# Demonstrates OSI layers, packet building, protocols, and transport modes
# =============================================================================

import random

def apply_protocol_rules(protocol: str, data: str, encryption_required: bool) -> dict:
    """Applies application-layer protocol rules based on HTTP/HTTPS/FTP."""
    encrypted = encryption_required
    warning = ""
    note = f"Protocol {protocol.upper()} selected."

    if protocol == "HTTP":
        if encrypted:
            warning = "Warning: HTTP does not natively support encryption. Simulated as plaintext anyway for realism or wrapped."
            encrypted = False
        else:
            note = "HTTP transmits data in plaintext."
    elif protocol == "HTTPS":
        if not encrypted:
            warning = "Warning: HTTPS requires encryption (TLS). Imposing encryption layer."
            encrypted = True
        else:
            note = "HTTPS uses TLS encryption to secure the payload."
    elif protocol == "FTP":
        if encrypted:
            note = "FTPS / SFTP used to secure file transfer."
        else:
            note = "Basic FTP transfers data in plaintext."
    
    return {
        "protocol": protocol,
        "is_encrypted": encrypted,
        "note": note,
        "warning": warning
    }

def simulate_transport(transport_type: str) -> dict:
    """Simulates TCP vs UDP transport concepts."""
    transport_type = transport_type.upper()
    info = {"transport": transport_type}
    
    if transport_type == "TCP":
        info["action"] = "TCP Connection: SYN -> SYN-ACK -> ACK. Reliable delivery."
        info["ack"] = "ACK: Received"
    elif transport_type == "UDP":
        info["action"] = "UDP Transmission: Best effort, connectionless."
        info["ack"] = "No ACK in UDP"
    else:
        info["action"] = f"Unknown transport {transport_type}."
        info["ack"] = "N/A"
        
    return info

def build_packet(data: str, protocol: str, transport: str) -> dict:
    """Builds a simulated network packet with IP, Transport headers, and payload."""
    src_ip = f"192.168.1.{random.randint(2, 50)}"
    dest_ip = f"203.0.113.{random.randint(2, 100)}"
    
    # Port assignments based on protocol
    dest_port = 80
    if protocol == "HTTPS":
        dest_port = 443
    elif protocol == "FTP":
        dest_port = 21
        
    src_port = random.randint(1024, 65535)
    
    return {
        "ip_header": {
            "src_ip": src_ip,
            "dest_ip": dest_ip
        },
        "transport_header": {
            "src_port": src_port,
            "dest_port": dest_port
        },
        "payload": data
    }

def simulate_osi_layers(packet: dict, protocol_info: dict, transport_info: dict) -> list:
    """Simulates the 5-layer internet model (condensed OSI)."""
    layers = []
    
    # Application / Presentation
    enc_status = "Encrypted" if protocol_info.get('is_encrypted') else "Plaintext"
    layers.append({
        "layer": "Application",
        "action": f"{protocol_info['protocol']} protocol selected. Payload is {enc_status}."
    })
    
    # Transport
    layers.append({
        "layer": "Transport",
        "action": transport_info['action'] + f" Src Port: {packet['transport_header']['src_port']} -> Dest Port: {packet['transport_header']['dest_port']}"
    })
    
    # Network
    layers.append({
        "layer": "Network",
        "action": f"Routing via IP. Src IP: {packet['ip_header']['src_ip']} -> Dest IP: {packet['ip_header']['dest_ip']}"
    })
    
    # Data Link
    layers.append({
        "layer": "Data Link",
        "action": "Frame created with source and destination MAC addresses."
    })
    
    # Physical
    layers.append({
        "layer": "Physical",
        "action": "Bits transmitted over the medium (WiFi/Ethernet)."
    })
    
    return layers

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Arc, Circle } from 'react-konva';

const KonvaFloorPlan = ({ 
  floorPlanData, 
  width = 800, 
  height = 600, 
  onRoomUpdate,
  onFloorPlanUpdate,
  isEditable = false 
}) => {
  const [rooms, setRooms] = useState([]);
  const [walls, setWalls] = useState([]);
  const [doors, setDoors] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [selectedWall, setSelectedWall] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'room', 'door', 'wall'
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(25);
  const [creationMode, setCreationMode] = useState(null); // 'door', 'wall', null
  const [isCreating, setIsCreating] = useState(false);
  const [newElementStart, setNewElementStart] = useState(null);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [doorColor, setDoorColor] = useState('#8B4513');
  const [wallColor, setWallColor] = useState('#000000');
  const [doorWidth, setDoorWidth] = useState(6);
  const [wallWidth, setWallWidth] = useState(4);
  const [totalFloorArea, setTotalFloorArea] = useState(10000); // Total area in square units
  const [roomPercentages, setRoomPercentages] = useState({}); // Room ID -> percentage mapping
  const [availablePercentage, setAvailablePercentage] = useState(100);
  const [roomTypeDistribution, setRoomTypeDistribution] = useState({}); // Room type -> total percentage
  const [isInternalUpdate, setIsInternalUpdate] = useState(false); // Track internal updates to prevent double processing
  const [draggingWallEndpoint, setDraggingWallEndpoint] = useState(null); // Track which wall endpoint is being dragged
  const userModifiedWalls = useRef(false); // Track if user has modified walls
  const lastUpdate3D = useRef(0); // Throttle 3D updates during drag
  const stageRef = useRef();
  
  // Undo/Redo history management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false); // Flag to prevent saving history during undo/redo

  // Save current state to history
  const saveToHistory = useCallback((customRooms, customWalls, customDoors) => {
    if (isUndoRedo.current) return; // Don't save during undo/redo
    
    const currentState = {
      rooms: JSON.parse(JSON.stringify(customRooms !== undefined ? customRooms : rooms)),
      walls: JSON.parse(JSON.stringify(customWalls !== undefined ? customWalls : walls)),
      doors: JSON.parse(JSON.stringify(customDoors !== undefined ? customDoors : doors)),
      timestamp: Date.now()
    };
    
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add current state
      newHistory.push(currentState);
      // Limit history to last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    
    setHistoryIndex(prev => {
      const newIndex = Math.min(prev + 1, 49);
      return newIndex;
    });
  }, [rooms, walls, doors, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      
      setRooms(prevState.rooms);
      setWalls(prevState.walls);
      setDoors(prevState.doors);
      setHistoryIndex(newIndex);
      
      // Trigger update to parent
      requestAnimationFrame(() => {
        if (onFloorPlanUpdate && floorPlanData) {
          const updatedData = {
            ...floorPlanData,
            rooms: prevState.rooms,
            walls: prevState.walls,
            doors: prevState.doors,
            _updateTimestamp: Date.now()
          };
          onFloorPlanUpdate(updatedData);
        }
        isUndoRedo.current = false;
      });
    }
  }, [historyIndex, history, onFloorPlanUpdate, floorPlanData]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      setRooms(nextState.rooms);
      setWalls(nextState.walls);
      setDoors(nextState.doors);
      setHistoryIndex(newIndex);
      
      // Trigger update to parent
      requestAnimationFrame(() => {
        if (onFloorPlanUpdate && floorPlanData) {
          const updatedData = {
            ...floorPlanData,
            rooms: nextState.rooms,
            walls: nextState.walls,
            doors: nextState.doors,
            _updateTimestamp: Date.now()
          };
          onFloorPlanUpdate(updatedData);
        }
        isUndoRedo.current = false;
      });
    }
  }, [historyIndex, history, onFloorPlanUpdate, floorPlanData]);

  // Snap to grid helper function
  const snapToGridCoordinate = useCallback((value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Helper function to trigger onFloorPlanUpdate with current state
  const triggerFloorPlanUpdate = useCallback((allowDuringDrag = false, currentWalls = null) => {
    if (onFloorPlanUpdate && floorPlanData && (allowDuringDrag || !isDragging)) {
      // Use provided walls or fall back to state
      const wallsToUse = currentWalls || walls;
      
      console.log('🚀 triggerFloorPlanUpdate called with:', {
        allowDuringDrag,
        isDragging,
        roomsCount: rooms.length,
        roomsData: rooms.map(r => ({ id: r.id, name: r.name, source: r.source }))
      });
      
      // Calculate the same scaling factors used in data conversion
      const plotWidth = 1000; 
      const plotHeight = 1000; 
      const margin = 40;
      const scaleX = (width - margin * 2) / plotWidth;
      const scaleY = (height - margin * 2) / plotHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Convert rooms back to original coordinates
      const originalRooms = rooms.map(room => ({
        ...room,
        id: room.id,
        type: room.type || 'Room',
        tag: room.tag || room.type || 'room',
        name: room.name || 'New Room',
        x: room.originalX !== undefined ? room.originalX : (room.x - margin) / scale,
        y: room.originalY !== undefined ? room.originalY : (room.y - margin) / scale,
        width: room.originalWidth !== undefined ? room.originalWidth : room.width / scale,
        height: room.originalHeight !== undefined ? room.originalHeight : room.height / scale,
        // Preserve visual properties for consistency
        fill: room.fill,
        stroke: room.stroke,
        strokeWidth: room.strokeWidth
      }));
      
      // Convert walls back to original coordinates
      const originalWalls = wallsToUse.map(wall => ({
        ...wall,
        x1: (wall.points[0] - margin) / scale,
        y1: (wall.points[1] - margin) / scale,
        x2: (wall.points[2] - margin) / scale,
        y2: (wall.points[3] - margin) / scale,
        points: [
          (wall.points[0] - margin) / scale,
          (wall.points[1] - margin) / scale,
          (wall.points[2] - margin) / scale,
          (wall.points[3] - margin) / scale
        ]
      }));
      
      // Convert doors back to original coordinates
      const originalDoors = doors.map(door => ({
        ...door,
        points: [
          (door.points[0] - margin) / scale,
          (door.points[1] - margin) / scale,
          (door.points[2] - margin) / scale,
          (door.points[3] - margin) / scale
        ],
        x1: (door.points[0] - margin) / scale,
        y1: (door.points[1] - margin) / scale,
        x2: (door.points[2] - margin) / scale,
        y2: (door.points[3] - margin) / scale
      }));
      
      // Update mapData to ensure 3D view receives the changes
      let updatedMapData = floorPlanData.mapData ? [...floorPlanData.mapData] : [];
      
      // Update or add walls in mapData
      originalWalls.forEach(wall => {
        const wallMapItem = {
          type: 'wall',
          id: wall.id,
          x1: wall.x1,
          y1: wall.y1,
          x2: wall.x2,
          y2: wall.y2,
          stroke: wall.stroke,
          strokeWidth: wall.strokeWidth
        };
        
        // Find existing wall by id OR by type='wall' or type='Wall'
        const existingIndex = updatedMapData.findIndex(item => 
          (item.id === wall.id) || 
          (item.type && item.type.toLowerCase() === 'wall' && 
           Math.abs(item.x1 - wall.x1) < 1 && 
           Math.abs(item.y1 - wall.y1) < 1)
        );
        
        if (existingIndex >= 0) {
          // Update existing wall
          updatedMapData[existingIndex] = wallMapItem;
        } else {
          // Add new wall to mapData
          updatedMapData.push(wallMapItem);
        }
      });
      
      const updatedData = {
        ...floorPlanData,
        rooms: originalRooms,
        walls: originalWalls,
        doors: originalDoors,
        mapData: updatedMapData,
        // Add timestamp to force update
        _updateTimestamp: Date.now(),
        // Ensure room count and data integrity
        totalRooms: originalRooms.length
      };
      
      console.log('🔄 Sending floor plan update:');
      console.log('  - Rooms count:', originalRooms.length);
      console.log('  - Walls count:', originalWalls.length);
      console.log('  - Doors count:', originalDoors.length);
      console.log('  - MapData count:', updatedMapData.length);
      console.log('  - Room data sample:', originalRooms.length > 0 ? originalRooms[0] : 'No rooms');
      if (allowDuringDrag) {
        console.log('  - UPDATE DURING DRAG (3D should update)');
      }
      
      setIsInternalUpdate(true);
      onFloorPlanUpdate(updatedData);
      // Clear the flag after a short delay to allow the parent to process the update
      setTimeout(() => setIsInternalUpdate(false), 50);
    }
  }, [onFloorPlanUpdate, floorPlanData, rooms, walls, doors, width, height, isDragging]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditable) return;
      
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      
      // Delete selected item (only with Delete key, not Backspace)
      if (e.key === 'Delete') {
        if (selectedRoom) {
          removeRoomAndRebalance(selectedRoom);
          setSelectedRoom(null);
          saveToHistory();
        } else if (selectedDoor) {
          const updatedDoors = doors.filter(d => d.id !== selectedDoor);
          console.log('Keyboard delete door:', selectedDoor);
          setDoors(updatedDoors);
          setSelectedDoor(null);
          saveToHistory(undefined, undefined, updatedDoors);
          
          // Immediately notify parent
          if (onFloorPlanUpdate && floorPlanData) {
            const plotWidth = 1000;
            const plotHeight = 1000;
            const margin = 40;
            const scaleX = (width - margin * 2) / plotWidth;
            const scaleY = (height - margin * 2) / plotHeight;
            const scale = Math.min(scaleX, scaleY);
            
            const originalDoors = updatedDoors.map(door => ({
              ...door,
              points: [
                (door.points[0] - margin) / scale,
                (door.points[1] - margin) / scale,
                (door.points[2] - margin) / scale,
                (door.points[3] - margin) / scale
              ],
              x1: (door.points[0] - margin) / scale,
              y1: (door.points[1] - margin) / scale,
              x2: (door.points[2] - margin) / scale,
              y2: (door.points[3] - margin) / scale
            }));
            
            setIsInternalUpdate(true);
            onFloorPlanUpdate({ ...floorPlanData, doors: originalDoors });
            setTimeout(() => setIsInternalUpdate(false), 100);
          }
        } else if (selectedWall) {
          const updatedWalls = walls.filter(w => w.id !== selectedWall);
          console.log('Keyboard delete wall:', selectedWall);
          setWalls(updatedWalls);
          setSelectedWall(null);
          saveToHistory(undefined, updatedWalls, undefined);
          
          // Immediately notify parent
          if (onFloorPlanUpdate && floorPlanData) {
            const plotWidth = 1000;
            const plotHeight = 1000;
            const margin = 40;
            const scaleX = (width - margin * 2) / plotWidth;
            const scaleY = (height - margin * 2) / plotHeight;
            const scale = Math.min(scaleX, scaleY);
            
            const originalWalls = updatedWalls.map(wall => ({
              ...wall,
              points: [
                (wall.points[0] - margin) / scale,
                (wall.points[1] - margin) / scale,
                (wall.points[2] - margin) / scale,
                (wall.points[3] - margin) / scale
              ],
              x1: (wall.points[0] - margin) / scale,
              y1: (wall.points[1] - margin) / scale,
              x2: (wall.points[2] - margin) / scale,
              y2: (wall.points[3] - margin) / scale
            }));
            
            setIsInternalUpdate(true);
            onFloorPlanUpdate({ ...floorPlanData, walls: originalWalls });
            setTimeout(() => setIsInternalUpdate(false), 100);
          }
        }
      }
      
      // Deselect all with Escape
      if (e.key === 'Escape') {
        setSelectedRoom(null);
        setSelectedDoor(null);
        setSelectedWall(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditable, selectedRoom, selectedDoor, selectedWall, rooms, doors, walls, onFloorPlanUpdate, floorPlanData, width, height]);

  // Convert backend data to Konva-friendly format - only when data comes from external source
  useEffect(() => {
    // Skip loading if this is an internal update (user made changes in 2D editor)
    if (!floorPlanData || isInternalUpdate || isDragging || draggingWallEndpoint) {
      console.log('Skipping data load - isInternalUpdate:', isInternalUpdate, 'isDragging:', isDragging, 'draggingWallEndpoint:', draggingWallEndpoint);
      return;
    }
    
    // Skip if we have recent local rooms to prevent overriding them
    const hasRecentLocalRooms = rooms.some(room => room.source === 'local');
    
    if (hasRecentLocalRooms && isInternalUpdate) {
      console.log('Skipping data load - recent local rooms exist and internal update active');
      return;
    }
    
    console.log('=== LOADING FLOOR PLAN DATA FROM EXTERNAL SOURCE ===');
    console.log('floorPlanData:', floorPlanData);
    console.log('mapData:', floorPlanData.mapData);
    console.log('mapData length:', floorPlanData.mapData?.length);
    
    if (floorPlanData.mapData) {
      const doors = floorPlanData.mapData.filter(item => item.type === 'Door');
      const walls = floorPlanData.mapData.filter(item => item.type === 'Wall');
      console.log('Found walls:', walls.length);
      console.log('Found doors:', doors.length);
      console.log('Door items:', doors);
    }
    
    // Calculate scaling factors to fit the floor plan within canvas boundaries
    const plotWidth = 1000; // Default backend plot width
    const plotHeight = 1000; // Default backend plot height
    const margin = 40; // Margin from canvas edges
    
    const scaleX = (width - margin * 2) / plotWidth;
    const scaleY = (height - margin * 2) / plotHeight;
    const scale = Math.min(scaleX, scaleY); // Use uniform scaling to maintain aspect ratio
    
    // Convert and merge rooms data with proper scaling
    const backendRoomsData = (floorPlanData.rooms || []).map((room, index) => ({
      id: room.id || `room-${index}`,
      x: (room.x || 0) * scale + margin,
      y: (room.y || 0) * scale + margin,
      width: (room.width || 100) * scale,
      height: (room.height || 100) * scale,
      fill: getRoomColor(room.type || room.tag),
      stroke: '#333',
      strokeWidth: 2,
      draggable: isEditable,
      type: room.type || room.tag || 'Room',
      tag: room.tag || `room-${index}`,
      name: getRoomName(room.type || room.tag),
      originalX: room.x || 0,
      originalY: room.y || 0,
      originalWidth: room.width || 100,
      originalHeight: room.height || 100,
      scale: scale,
      source: 'backend' // Mark as backend room
    }));
    
    // Merge with existing rooms (preserve locally created rooms)
    const existingLocalRooms = rooms.filter(room => 
      room.source !== 'backend' && !backendRoomsData.some(br => br.id === room.id)
    );
    
    const mergedRooms = [...backendRoomsData, ...existingLocalRooms];
    
    console.log('Room merge result:', {
      backend: backendRoomsData.length,
      local: existingLocalRooms.length,
      total: mergedRooms.length
    });

    // Convert walls data with proper scaling - prioritize direct walls array over mapData
    let wallsData = [];
    
    // Method 1: Check direct walls array first (preferred)
    if (floorPlanData.walls && Array.isArray(floorPlanData.walls) && floorPlanData.walls.length > 0) {
      wallsData = floorPlanData.walls.map((wall, index) => {
        // Handle both points array format and x1,y1,x2,y2 format
        let points;
        if (wall.points && Array.isArray(wall.points)) {
          points = [
            (wall.points[0] || 0) * scale + margin,
            (wall.points[1] || 0) * scale + margin,
            (wall.points[2] || 0) * scale + margin,
            (wall.points[3] || 0) * scale + margin
          ];
        } else {
          points = [
            (wall.x1 || 0) * scale + margin,
            (wall.y1 || 0) * scale + margin,
            (wall.x2 || 0) * scale + margin,
            (wall.y2 || 0) * scale + margin
          ];
        }
        
        return {
          id: wall.id || `wall-${index}`,
          points,
          stroke: wall.stroke || '#000',
          strokeWidth: Math.max(1, (wall.strokeWidth || 4) * scale),
          lineCap: 'round'
        };
      });
    } else if (floorPlanData.mapData && Array.isArray(floorPlanData.mapData)) {
      // Method 2: Fallback to mapData for walls
      wallsData = floorPlanData.mapData
        .filter(item => item.type === 'Wall')
        .map((wall, index) => ({
          id: wall.id || `wall-${index}`,
          points: [
            (wall.x1 || 0) * scale + margin, 
            (wall.y1 || 0) * scale + margin, 
            (wall.x2 || 0) * scale + margin, 
            (wall.y2 || 0) * scale + margin
          ],
          stroke: '#000',
          strokeWidth: Math.max(1, 4 * scale),
          lineCap: 'round'
        }));
    }

    // Convert doors data with proper scaling - prioritize direct doors array over mapData
    let doorsData = [];
    
    // Method 1: Check direct doors array first (preferred)
    if (floorPlanData.doors && Array.isArray(floorPlanData.doors) && floorPlanData.doors.length > 0) {
      doorsData = floorPlanData.doors.map((door, index) => {
        // Handle both points array format and x1,y1,x2,y2 format
        let points;
        if (door.points && Array.isArray(door.points)) {
          points = [
            (door.points[0] || 0) * scale + margin,
            (door.points[1] || 0) * scale + margin,
            (door.points[2] || 0) * scale + margin,
            (door.points[3] || 0) * scale + margin
          ];
        } else {
          points = [
            (door.x1 || 0) * scale + margin,
            (door.y1 || 0) * scale + margin,
            (door.x2 || 0) * scale + margin,
            (door.y2 || 0) * scale + margin
          ];
        }
        
        return {
          id: door.id || `door-${index}`,
          points,
          stroke: door.stroke || '#8B4513',
          strokeWidth: Math.max(6, (door.strokeWidth || 4) * scale),
          lineCap: 'round'
        };
      });
    } else if (floorPlanData.mapData && Array.isArray(floorPlanData.mapData)) {
      // Method 2: Fallback to mapData for doors only if no direct doors
      const mapDoors = floorPlanData.mapData
        .filter(item => item.type === 'Door')
        .map((door, index) => ({
          id: door.id || `door-${index}`, // Use existing ID if available
          points: [
            (door.x1 || 0) * scale + margin, 
            (door.y1 || 0) * scale + margin, 
            (door.x2 || 0) * scale + margin, 
            (door.y2 || 0) * scale + margin
          ],
          stroke: door.stroke || '#8B4513',
          strokeWidth: Math.max(6, door.strokeWidth * scale || 4 * scale),
          lineCap: 'round'
        }));
      doorsData = mapDoors;
    }
    
    // Method 3: Auto-generate doors on room walls if no doors found
    if (doorsData.length === 0 && roomsData.length > 0) {
      console.log('No doors found in data, generating doors on room walls');
      const generatedDoors = [];
      
      roomsData.forEach((room, roomIndex) => {
        // Add door to the front wall (bottom edge) of each room
        const doorWidth = Math.min(80 * scale, room.width * 0.3); // Door width is 30% of room width or 80 scaled units
        const doorX = room.x + (room.width - doorWidth) / 2; // Center the door on the wall
        const doorY = room.y + room.height; // Bottom edge of room
        
        generatedDoors.push({
          id: `generated-door-${roomIndex}`,
          points: [
            doorX, 
            doorY, 
            doorX + doorWidth, 
            doorY
          ],
          stroke: '#8B4513',
          strokeWidth: Math.max(6, 4 * scale),
          lineCap: 'round',
          roomId: room.id
        });
      });
      
      doorsData = [...doorsData, ...generatedDoors];
      console.log('Generated doors:', generatedDoors.length);
    }

    const finalDoorsData = doorsData;
    
    // Preserve user-modified walls - keep current wall state if user has made changes
    // Only reload from backend if walls array is empty or this is initial load
    const shouldPreserveWalls = walls.length > 0 && (isInternalUpdate || isDragging || userModifiedWalls.current);
    
    const finalWallsData = shouldPreserveWalls ? walls : (() => {
      // Merge local walls with backend walls
      const mergedWalls = [...wallsData];
      const localWalls = walls.filter(w => 
        w.id && (w.id.startsWith('new-wall-') || w.id.startsWith('created-wall-'))
      );
      
      localWalls.forEach(localWall => {
        const existsInBackend = mergedWalls.some(w => w.id === localWall.id);
        if (!existsInBackend) {
          mergedWalls.push(localWall);
        }
      });
      
      return mergedWalls;
    })();
    
    // Only update if there are actual changes to prevent unnecessary re-renders
    if (mergedRooms.length !== rooms.length || 
        mergedRooms.some((room, index) => {
          const existingRoom = rooms[index];
          return !existingRoom || room.id !== existingRoom.id;
        })) {
      setRooms(mergedRooms);
    }
    setWalls(finalWallsData);
    setDoors(finalDoorsData);
    
    console.log('Walls loaded:', finalWallsData.length, shouldPreserveWalls ? '(preserved user changes)' : '(loaded from backend)');
    
    console.log('=== DOOR PLACEMENT DEBUG ===');
    console.log('Final doors data:', finalDoorsData);
    console.log('Rooms data:', mergedRooms);
    console.log('Scale factor:', scale);
    console.log('Margin:', margin);
  }, [floorPlanData, isEditable, isInternalUpdate, isDragging, draggingWallEndpoint]);

  // Get room color based on type
  const getRoomColor = (roomType) => {
    const colors = {
      'livingroom': '#e3f2fd',
      'kitchen': '#fff3e0',
      'bedroom': '#f3e5f5',
      'bathroom': '#e8f5e8',
      'carporch': '#f1f8e9',
      'garden': '#e8f5e8',
      'drawingroom': '#fce4ec'
    };
    
    if (!roomType) return '#f5f5f5';
    const type = roomType.split('-')[0].toLowerCase();
    return colors[type] || '#f5f5f5';
  };

  // Get room display name
  const getRoomName = (roomType) => {
    if (!roomType) return 'Room';
    const type = roomType.split('-')[0];
    const number = roomType.split('-')[1] || '1';
    return `${type.toUpperCase()} ${number}`;
  };

  // Calculate door swing properties
  const calculateDoorSwing = (x1, y1, x2, y2) => {
    const doorLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const doorAngle = Math.atan2(y2 - y1, x2 - x1);
    
    // Determine swing direction (perpendicular to door)
    const swingAngle = doorAngle + Math.PI / 2;
    
    // Calculate swing end point (90-degree opening)
    const swingEndX = x1 + Math.cos(swingAngle) * doorLength * 0.9;
    const swingEndY = y1 + Math.sin(swingAngle) * doorLength * 0.9;
    
    // Calculate arc points for door swing
    const arcPoints = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const currentAngle = doorAngle + (swingAngle - doorAngle) * t;
      const arcX = x1 + Math.cos(currentAngle) * doorLength * 0.8;
      const arcY = y1 + Math.sin(currentAngle) * doorLength * 0.8;
      arcPoints.push(arcX, arcY);
    }
    
    return {
      doorLength,
      doorAngle: doorAngle * 180 / Math.PI,
      swingAngle: swingAngle * 180 / Math.PI,
      swingEndX,
      swingEndY,
      arcPoints
    };
  };

  // Handle room drag start
  const handleRoomDragStart = useCallback((e, roomId) => {
    if (!isEditable) return;
    
    const room = rooms.find(r => r.id === roomId);
    setDragStart({ x: room.x, y: room.y });
    setSelectedRoom(roomId);
    setSelectedDoor(null);
    setSelectedWall(null);
    setIsDragging(true);
    setDragType('room');
  }, [rooms, isEditable]);

  // Handle door drag start
  const handleDoorDragStart = useCallback((e, doorId) => {
    if (!isEditable) return;
    
    const door = doors.find(d => d.id === doorId);
    if (!door) return;
    
    // Store the initial drag position (this will be used as reference)
    setDragStart({ x: e.target.x(), y: e.target.y() });
    setSelectedDoor(doorId);
    setSelectedRoom(null);
    setSelectedWall(null);
    setIsDragging(true);
    setDragType('door');
    
    console.log('Door drag started:', {
      doorId,
      points: door.points,
      startPos: { x: e.target.x(), y: e.target.y() }
    });
  }, [doors, isEditable]);

  // Handle wall drag start
  const handleWallDragStart = useCallback((e, wallId) => {
    if (!isEditable) return;
    
    const wall = walls.find(w => w.id === wallId);
    setDragStart({ x: wall.points[0], y: wall.points[1] });
    setSelectedWall(wallId);
    setSelectedRoom(null);
    setSelectedDoor(null);
    setIsDragging(true);
    setDragType('wall');
  }, [walls, isEditable]);

  // Handle room drag end - with free movement and overlapping allowed
  const handleRoomDragEnd = useCallback((e, roomId) => {
    if (!isEditable) return;

    const newX = e.target.x();
    const newY = e.target.y();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      setIsDragging(false);
      setDragType(null);
      return;
    }
    
    const margin = 40;
    
    // Apply snap to grid but allow free movement (no boundary constraints for overlapping)
    const snappedX = snapToGrid ? snapToGridCoordinate(newX) : newX;
    const snappedY = snapToGrid ? snapToGridCoordinate(newY) : newY;

    // Convert back to original coordinates for backend
    const originalX = (snappedX - margin) / (room.scale || 1);
    const originalY = (snappedY - margin) / (room.scale || 1);

    // Ensure the room maintains its properties during move
    const updatedRooms = rooms.map(r => 
      r.id === roomId 
        ? { 
            ...r, 
            x: snappedX, 
            y: snappedY, 
            originalX, 
            originalY,
            // Preserve all room properties to prevent disappearing
            fill: r.fill || '#bbdefb',
            stroke: r.stroke || '#1976d2',
            strokeWidth: r.strokeWidth || 2,
            width: r.width,
            height: r.height,
            draggable: r.draggable !== false
          }
        : r
    );

    setRooms(updatedRooms);
    saveToHistory(updatedRooms, undefined, undefined);
    setIsDragging(false);
    setDragType(null);

    // Send update to parent component with original coordinates
    if (onRoomUpdate) {
      onRoomUpdate(roomId, {
        x: originalX,
        y: originalY,
        width: room.originalWidth,
        height: room.originalHeight
      });
    }

    console.log(`Room ${roomId} moved freely to:`, {
      screenPosition: { x: snappedX, y: snappedY },
      originalPosition: { x: originalX, y: originalY },
      overlapping: 'allowed'
    });

    // Trigger 3D update after room movement
    setTimeout(() => triggerFloorPlanUpdate(true), 10);
  }, [rooms, isEditable, onRoomUpdate, snapToGridCoordinate, saveToHistory, triggerFloorPlanUpdate]);

  // Handle room drag move for visual feedback
  const handleRoomDragMove = useCallback((e, roomId) => {
    if (!isEditable || !isDragging) return;
    
    // Only update room state, don't modify the drag target position
    // This prevents conflicts with Konva's internal drag handling
    const currentX = e.target.x();
    const currentY = e.target.y();
    
    // Update room position in state for real-time feedback
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { ...room, x: currentX, y: currentY }
          : room
      )
    );
  }, [isEditable, isDragging]);

  // Helper function to find the nearest wall edge for door placement
  const findNearestWallEdge = useCallback((x, y, doorLength) => {
    let nearestWall = null;
    let minDistance = Infinity;
    let snapPosition = null;
    
    // Snap to custom walls instead of room boundaries
    walls.forEach(wall => {
      // Get wall coordinates
      const wallData = {
        x1: wall.points[0],
        y1: wall.points[1],
        x2: wall.points[2],
        y2: wall.points[3],
        id: wall.id
      };
      
      // Calculate distance from point to wall line
      const wallLength = Math.sqrt((wallData.x2 - wallData.x1) ** 2 + (wallData.y2 - wallData.y1) ** 2);
      const wallUnitX = (wallData.x2 - wallData.x1) / wallLength;
      const wallUnitY = (wallData.y2 - wallData.y1) / wallLength;
      
      // Project point onto wall line
      const toPointX = x - wallData.x1;
      const toPointY = y - wallData.y1;
      const projectionLength = toPointX * wallUnitX + toPointY * wallUnitY;
      
      // Clamp projection to wall bounds (leave some margin for door placement)
      const doorMargin = doorLength / 2;
      const clampedProjection = Math.max(doorMargin, Math.min(wallLength - doorMargin, projectionLength));
      
      // Calculate closest point on wall
      const closestX = wallData.x1 + wallUnitX * clampedProjection;
      const closestY = wallData.y1 + wallUnitY * clampedProjection;
      
      // Calculate distance
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
      
      // Check if we can fit the door on this wall segment
      const availableLength = wallLength - doorLength;
      const doorCanFit = availableLength >= 0;
      
      if (distance < minDistance && doorCanFit && distance < 50) { // 50px snap threshold
        minDistance = distance;
        nearestWall = { ...wallData, wallId: wall.id };
        
        // Calculate door position centered on the closest point
        const doorStartX = closestX - (wallUnitX * doorLength / 2);
        const doorStartY = closestY - (wallUnitY * doorLength / 2);
        const doorEndX = closestX + (wallUnitX * doorLength / 2);
        const doorEndY = closestY + (wallUnitY * doorLength / 2);
        
        snapPosition = {
          x1: doorStartX,
          y1: doorStartY,
          x2: doorEndX,
          y2: doorEndY
        };
      }
    });
    
    return { nearestWall, snapPosition, distance: minDistance };
  }, [walls]);

  // Handle door drag end
  const handleDoorDragEnd = useCallback((e, doorId) => {
    if (!isEditable) return;

    const door = doors.find(d => d.id === doorId);
    if (!door) return;
    
    const margin = 40;
    
    // Get the drag offset from the drag start position
    const dragOffsetX = e.target.x() - dragStart.x;
    const dragOffsetY = e.target.y() - dragStart.y;
    
    // Calculate new door center position
    const doorCenterX = (door.points[0] + door.points[2]) / 2 + dragOffsetX;
    const doorCenterY = (door.points[1] + door.points[3]) / 2 + dragOffsetY;
    
    // Calculate door length
    const doorLength = Math.sqrt(
      (door.points[2] - door.points[0]) ** 2 + 
      (door.points[3] - door.points[1]) ** 2
    );
    
    // Find nearest wall edge
    const { nearestWall, snapPosition, distance } = findNearestWallEdge(doorCenterX, doorCenterY, doorLength);
    
    let finalDoorPoints;
    
    if (nearestWall && snapPosition) {
      // Snap to wall
      finalDoorPoints = [snapPosition.x1, snapPosition.y1, snapPosition.x2, snapPosition.y2];
      console.log('Door snapped to wall:', nearestWall.wallId);
    } else {
      // Return to original position if no valid wall found
      finalDoorPoints = door.points;
      console.log('Door returned to original position - no valid wall nearby');
    }
    
    // Update door position
    const updatedDoors = doors.map(d => 
      d.id === doorId 
        ? { ...d, points: finalDoorPoints }
        : d
    );

    console.log('Door drag completed - updating doors only, rooms should not change');
    console.log('Current rooms count:', rooms.length);
    console.log('Current doors count:', doors.length);
    console.log('Updating door', doorId, 'from', door.points, 'to', finalDoorPoints);
    
    // Important: Reset the dragged element's visual position to prevent ghost copies
    // This ensures the Konva object returns to its original position while our state handles the new position
    e.target.position({ x: 0, y: 0 });
    
    // Force a re-render of the doors layer to clear any visual artifacts
    const stage = e.target.getStage();
    if (stage) {
      stage.batchDraw();
    }
    
    // Update doors state - this should replace the old door, not add a new one
    setDoors(updatedDoors);
    
    // Clear dragging state AFTER updating doors to prevent race conditions
    setTimeout(() => {
      setIsDragging(false);
      setDragType(null);
    }, 10);
    
    console.log('Updated doors array:', updatedDoors.map(d => ({ id: d.id, points: d.points })));
    console.log('Total doors after update:', updatedDoors.length);
    
    // Trigger update after state has settled, but only update doors
    setTimeout(() => {
      if (onFloorPlanUpdate && floorPlanData) {
        console.log('Triggering floor plan update - doors only');
        const plotWidth = 1000; 
        const plotHeight = 1000; 
        const margin = 40;
        const scaleX = (width - margin * 2) / plotWidth;
        const scaleY = (height - margin * 2) / plotHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Convert only the updated doors back to original coordinates
        const originalDoors = updatedDoors.map(door => ({
          ...door,
          points: [
            (door.points[0] - margin) / scale,
            (door.points[1] - margin) / scale,
            (door.points[2] - margin) / scale,
            (door.points[3] - margin) / scale
          ],
          x1: (door.points[0] - margin) / scale,
          y1: (door.points[1] - margin) / scale,
          x2: (door.points[2] - margin) / scale,
          y2: (door.points[3] - margin) / scale
        }));
        
        const updatedData = {
          ...floorPlanData,
          doors: originalDoors
          // Don't update rooms or walls unless they actually changed
        };
        
        setIsInternalUpdate(true);
        onFloorPlanUpdate(updatedData);
        setTimeout(() => setIsInternalUpdate(false), 50);
      }
    }, 100);
    
    // Reset target position to prevent visual jumping
    e.target.position({ x: 0, y: 0 });
    
    console.log('Door drag completed:', {
      doorId,
      oldPoints: door.points,
      newPoints: finalDoorPoints,
      wallFound: !!nearestWall,
      snapDistance: distance
    });
  }, [doors, width, height, isEditable, dragStart, findNearestWallEdge]);

  // Add new door
  const addNewDoor = useCallback(() => {
    // Calculate scale to match existing doors
    const plotWidth = 1000;
    const plotHeight = 1000;
    const margin = 40;
    const scaleX = (width - margin * 2) / plotWidth;
    const scaleY = (height - margin * 2) / plotHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Create door with consistent size (80 units in backend coordinates)
    const doorLength = 80 * scale; // Standard door width scaled to canvas
    const startX = 200;
    const startY = 200;
    
    const newDoor = {
      id: `new-door-${Date.now()}`,
      points: [startX, startY, startX + doorLength, startY], // Horizontal door with scaled length
      stroke: '#8B4513',
      strokeWidth: Math.max(6, 4 * scale), // Match the strokeWidth calculation from loading
      lineCap: 'round'
    };
    const updatedDoors = [...doors, newDoor];
    console.log('Adding new door:', newDoor.id, 'with length:', doorLength);
    
    setDoors(updatedDoors);
    setSelectedDoor(newDoor.id);
    setSelectedRoom(null);
    setSelectedWall(null);
    saveToHistory(undefined, undefined, updatedDoors);
    
    // Immediately notify parent with the new door
    if (onFloorPlanUpdate && floorPlanData) {
      const originalDoors = updatedDoors.map(door => ({
        ...door,
        points: [
          (door.points[0] - margin) / scale,
          (door.points[1] - margin) / scale,
          (door.points[2] - margin) / scale,
          (door.points[3] - margin) / scale
        ],
        x1: (door.points[0] - margin) / scale,
        y1: (door.points[1] - margin) / scale,
        x2: (door.points[2] - margin) / scale,
        y2: (door.points[3] - margin) / scale
      }));
      
      setIsInternalUpdate(true);
      onFloorPlanUpdate({ ...floorPlanData, doors: originalDoors });
      setTimeout(() => setIsInternalUpdate(false), 100);
    }
  }, [doors, onFloorPlanUpdate, floorPlanData, width, height]);

  // Add new wall
  const addNewWall = useCallback(() => {
    // Calculate center position and appropriate wall size
    const centerX = width / 2;
    const centerY = height / 2;
    const wallLength = 150; // Default wall length
    
    const newWall = {
      id: `new-wall-${Date.now()}`,
      points: [centerX - wallLength/2, centerY, centerX + wallLength/2, centerY], // Horizontal wall at center
      stroke: '#000',
      strokeWidth: 4,
      lineCap: 'round'
    };
    const updatedWalls = [...walls, newWall];
    console.log('Adding new wall:', newWall.id);
    
    // Mark that user has modified walls
    userModifiedWalls.current = true;
    
    setWalls(updatedWalls);
    setSelectedWall(newWall.id);
    setSelectedRoom(null);
    setSelectedDoor(null);
    saveToHistory(undefined, updatedWalls, undefined);
    
    // Immediately notify parent with the new wall
    if (onFloorPlanUpdate && floorPlanData) {
      const plotWidth = 1000;
      const plotHeight = 1000;
      const margin = 40;
      const scaleX = (width - margin * 2) / plotWidth;
      const scaleY = (height - margin * 2) / plotHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const originalWalls = updatedWalls.map(wall => ({
        ...wall,
        points: [
          (wall.points[0] - margin) / scale,
          (wall.points[1] - margin) / scale,
          (wall.points[2] - margin) / scale,
          (wall.points[3] - margin) / scale
        ],
        x1: (wall.points[0] - margin) / scale,
        y1: (wall.points[1] - margin) / scale,
        x2: (wall.points[2] - margin) / scale,
        y2: (wall.points[3] - margin) / scale
      }));
      
      setIsInternalUpdate(true);
      onFloorPlanUpdate({ ...floorPlanData, walls: originalWalls });
      setTimeout(() => {
        setIsInternalUpdate(false);
        // Allow reload after sufficient time for save to complete
        setTimeout(() => userModifiedWalls.current = false, 2000);
      }, 100);
    }
  }, [walls, onFloorPlanUpdate, floorPlanData, width, height]);

  // Calculate area from room dimensions
  const calculateRoomArea = useCallback((width, height, scale = 1) => {
    const actualWidth = width / scale;
    const actualHeight = height / scale;
    return actualWidth * actualHeight;
  }, []);

  // Calculate percentage of total area
  const calculateAreaPercentage = useCallback((area) => {
    return (area / totalFloorArea) * 100;
  }, [totalFloorArea]);

  // Get room area from percentage
  const getAreaFromPercentage = useCallback((percentage) => {
    return (percentage / 100) * totalFloorArea;
  }, [totalFloorArea]);

  // Rebalance all room percentages to maintain 100% total
  const rebalanceRoomPercentages = useCallback((updatedRooms, excludeRoomId = null, currentPercentages = null) => {
    const percentagesToUse = currentPercentages || roomPercentages;
    const totalCurrentPercentage = Object.values(percentagesToUse).reduce((sum, percent) => sum + percent, 0);
    
    if (totalCurrentPercentage === 0) return percentagesToUse;

    const newPercentages = { ...percentagesToUse };
    
    // If we're updating a specific room, adjust others proportionally
    if (excludeRoomId && newPercentages[excludeRoomId]) {
      const excludedPercentage = newPercentages[excludeRoomId];
      const remainingPercentage = 100 - excludedPercentage;
      const otherRoomsTotal = totalCurrentPercentage - excludedPercentage;
      
      if (otherRoomsTotal > 0) {
        // Proportionally adjust other rooms
        updatedRooms.forEach(room => {
          if (room.id !== excludeRoomId && newPercentages[room.id]) {
            const currentPercent = newPercentages[room.id];
            newPercentages[room.id] = (currentPercent / otherRoomsTotal) * remainingPercentage;
          }
        });
      }
    } else {
      // Proportionally adjust all rooms to sum to 100%
      const scaleFactor = 100 / totalCurrentPercentage;
      updatedRooms.forEach(room => {
        if (newPercentages[room.id]) {
          newPercentages[room.id] *= scaleFactor;
        }
      });
    }

    return newPercentages;
  }, []); // Remove dependency on roomPercentages

  // Add new room with area allocation
  const addRoomWithAreaAllocation = useCallback((roomData, requestedPercentage = null) => {
    const defaultPercentage = requestedPercentage || 20; // Default 20% for new rooms
    const currentTotal = Object.values(roomPercentages).reduce((sum, percent) => sum + percent, 0);
    
    let newPercentage = defaultPercentage;
    
    // If adding this room would exceed 100%, take from available or rebalance
    if (currentTotal + newPercentage > 100) {
      if (currentTotal < 100) {
        newPercentage = 100 - currentTotal; // Take remaining available
      } else {
        newPercentage = defaultPercentage;
        // Rebalance existing rooms to make space
        const rebalanceFactor = (100 - newPercentage) / currentTotal;
        const updatedPercentages = {};
        Object.keys(roomPercentages).forEach(roomId => {
          updatedPercentages[roomId] = roomPercentages[roomId] * rebalanceFactor;
        });
        setRoomPercentages(updatedPercentages);
      }
    }

    // Calculate room dimensions based on percentage
    const targetArea = getAreaFromPercentage(newPercentage);
    const aspectRatio = (roomData.width || 150) / (roomData.height || 100);
    const newHeight = Math.sqrt(targetArea / aspectRatio);
    const newWidth = newHeight * aspectRatio;

    const updatedRoom = {
      ...roomData,
      width: newWidth,
      height: newHeight,
      originalWidth: newWidth,
      originalHeight: newHeight
    };

    // Update room percentages
    setRoomPercentages(prev => ({
      ...prev,
      [roomData.id]: newPercentage
    }));

    return updatedRoom;
  }, [roomPercentages, getAreaFromPercentage]);

  // Update room percentage and adjust dimensions
  const updateRoomPercentage = useCallback((roomId, newPercentage) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Update percentages with rebalancing
    const updatedPercentages = { ...roomPercentages, [roomId]: newPercentage };
    const rebalanced = rebalanceRoomPercentages(rooms, roomId, updatedPercentages);
    rebalanced[roomId] = newPercentage;
    
    setRoomPercentages(rebalanced);

    // Calculate new dimensions based on percentage
    const targetArea = getAreaFromPercentage(newPercentage);
    const aspectRatio = room.width / room.height;
    const newHeight = Math.sqrt(targetArea / aspectRatio);
    const newWidth = newHeight * aspectRatio;

    // Update room dimensions
    const updatedRooms = rooms.map(r => 
      r.id === roomId 
        ? { 
            ...r, 
            width: newWidth * (r.scale || 1), 
            height: newHeight * (r.scale || 1),
            originalWidth: newWidth,
            originalHeight: newHeight
          }
        : r
    );

    setRooms(updatedRooms);

    if (onRoomUpdate) {
      onRoomUpdate(roomId, {
        x: room.originalX,
        y: room.originalY,
        width: newWidth,
        height: newHeight
      });
    }
  }, [rooms, roomPercentages, totalFloorArea, onRoomUpdate]); // Remove function dependencies

  // Remove room and rebalance percentages
  const removeRoomAndRebalance = useCallback((roomId) => {
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    const updatedPercentages = { ...roomPercentages };
    delete updatedPercentages[roomId];
    
    // Rebalance remaining rooms to 100%
    if (Object.keys(updatedPercentages).length > 0) {
      const rebalanced = rebalanceRoomPercentages(updatedRooms, null, newPercentages);
      setRoomPercentages(rebalanced);
    } else {
      setRoomPercentages({});
    }
    
    setRooms(updatedRooms);
  }, [rooms, roomPercentages]); // Remove function dependency

  // Initialize room percentages when rooms change
  useEffect(() => {
    const newPercentages = { ...roomPercentages };
    let hasChanges = false;

    rooms.forEach(room => {
      if (!newPercentages[room.id]) {
        // Calculate area directly without callback dependency
        const actualWidth = room.width / (room.scale || 1);
        const actualHeight = room.height / (room.scale || 1);
        const roomArea = actualWidth * actualHeight;
        const percentage = (roomArea / totalFloorArea) * 100;
        newPercentages[room.id] = percentage;
        hasChanges = true;
      }
    });

    // Remove percentages for deleted rooms
    Object.keys(newPercentages).forEach(roomId => {
      if (!rooms.find(r => r.id === roomId)) {
        delete newPercentages[roomId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // Rebalance to ensure 100% total
      const rebalanced = rebalanceRoomPercentages(rooms, null, newPercentages);
      setRoomPercentages(rebalanced);
    }
  }, [rooms, totalFloorArea]); // Only depend on rooms and totalFloorArea

  // Calculate available percentage
  useEffect(() => {
    const used = Object.values(roomPercentages).reduce((sum, percent) => sum + percent, 0);
    setAvailablePercentage(Math.max(0, 100 - used));
  }, [roomPercentages]);

  // Update room type distribution when rooms change
  useEffect(() => {
    const typeDistribution = {};
    
    rooms.forEach(room => {
      const roomType = room.type || room.tag || 'Room';
      const percentage = roomPercentages[room.id] || 0;
      
      if (!typeDistribution[roomType]) {
        typeDistribution[roomType] = 0;
      }
      typeDistribution[roomType] += percentage;
    });
    
    setRoomTypeDistribution(typeDistribution);
  }, [rooms, roomPercentages]);

  // Get rooms of same type
  const getRoomsOfType = useCallback((roomType) => {
    return rooms.filter(room => (room.type || room.tag || 'Room') === roomType);
  }, [rooms]);

  // Distribute percentage equally among rooms of same type
  const distributeTypePercentage = useCallback((roomType, totalPercentage) => {
    const roomsOfType = getRoomsOfType(roomType);
    if (roomsOfType.length === 0) return;
    
    const percentagePerRoom = totalPercentage / roomsOfType.length;
    
    roomsOfType.forEach(room => {
      updateRoomPercentage(room.id, percentagePerRoom);
    });
  }, [getRoomsOfType, updateRoomPercentage]);

  // Customize selected door
  const customizeDoor = useCallback((property, value) => {
    if (!selectedDoor) return;
    
    const updatedDoors = doors.map(door => {
      if (door.id === selectedDoor) {
        return { ...door, [property]: value };
      }
      return door;
    });
    
    setDoors(updatedDoors);
    saveToHistory(undefined, undefined, updatedDoors);
    // Trigger update after state change
    setTimeout(() => triggerFloorPlanUpdate(), 0);
  }, [selectedDoor, doors, triggerFloorPlanUpdate]);

  // Customize selected wall
  const customizeWall = useCallback((property, value) => {
    if (!selectedWall) return;
    
    const updatedWalls = walls.map(wall => {
      if (wall.id === selectedWall) {
        return { ...wall, [property]: value };
      }
      return wall;
    });
    
    setWalls(updatedWalls);
    saveToHistory(undefined, updatedWalls, undefined);
    // Trigger update after state change
    setTimeout(() => triggerFloorPlanUpdate(), 0);
  }, [selectedWall, walls, triggerFloorPlanUpdate]);

  // Customize selected room
  const customizeRoom = useCallback((property, value) => {
    if (!selectedRoom) return;
    
    const updatedRooms = rooms.map(room => {
      if (room.id === selectedRoom) {
        return { ...room, [property]: value };
      }
      return room;
    });
    
    setRooms(updatedRooms);
    saveToHistory(updatedRooms, undefined, undefined);
    // Trigger update after state change
    setTimeout(() => triggerFloorPlanUpdate(), 0);
  }, [selectedRoom, rooms, triggerFloorPlanUpdate]);

  // Handle door context menu (right-click)
  const handleDoorContextMenu = useCallback((e, doorId) => {
    e.evt.preventDefault();
    if (!isEditable) return;
    
    // Select the door
    setSelectedDoor(doorId);
    setSelectedRoom(null);
    setSelectedWall(null);
    
    // Show native context menu with delete option
    const confirmed = window.confirm('Delete this door?');
    if (confirmed) {
      const updatedDoors = doors.filter(d => d.id !== doorId);
      setDoors(updatedDoors);
      setSelectedDoor(null);
      setTimeout(() => triggerFloorPlanUpdate(), 0);
    }
  }, [isEditable, doors, triggerFloorPlanUpdate]);

  // Handle wall context menu (right-click)
  const handleWallContextMenu = useCallback((e, wallId) => {
    e.evt.preventDefault();
    if (!isEditable) return;
    
    // Select the wall
    setSelectedWall(wallId);
    setSelectedRoom(null);
    setSelectedDoor(null);
    
    // Show native context menu with delete option
    const confirmed = window.confirm('Delete this wall?');
    if (confirmed) {
      const updatedWalls = walls.filter(w => w.id !== wallId);
      setWalls(updatedWalls);
      setSelectedWall(null);
      setTimeout(() => triggerFloorPlanUpdate(), 0);
    }
  }, [isEditable, walls, triggerFloorPlanUpdate]);

  // Handle mouse move for creation preview
  const handleStageMouseMove = useCallback((e) => {
    if (!isEditable || !isCreating || !newElementStart) return;
    
    // Force re-render to update preview line
    const stage = e.target.getStage();
    if (stage) {
      stage.batchDraw();
    }
  }, [isEditable, isCreating, newElementStart]);

  // Handle door drag move (for visual feedback)
  const handleDoorDragMove = useCallback((e, doorId) => {
    if (!isEditable || !isDragging) return;
    
    const door = doors.find(d => d.id === doorId);
    if (!door) return;
    
    // Get current drag position
    const dragOffsetX = e.target.x() - dragStart.x;
    const dragOffsetY = e.target.y() - dragStart.y;
    
    // Calculate new door center position
    const doorCenterX = (door.points[0] + door.points[2]) / 2 + dragOffsetX;
    const doorCenterY = (door.points[1] + door.points[3]) / 2 + dragOffsetY;
    
    // Calculate door length
    const doorLength = Math.sqrt(
      (door.points[2] - door.points[0]) ** 2 + 
      (door.points[3] - door.points[1]) ** 2
    );
    
    // Find nearest wall for preview
    const { nearestWall, snapPosition } = findNearestWallEdge(doorCenterX, doorCenterY, doorLength);
    
    // Change door color based on whether it can snap to a wall
    const targetLine = e.target;
    if (nearestWall && snapPosition) {
      targetLine.stroke('#4CAF50'); // Green when near a valid wall
    } else {
      targetLine.stroke('#FF5722'); // Red when not near a valid wall
    }
    
    // Apply snap to grid during drag for visual feedback
    const currentX = snapToGridCoordinate(e.target.x());
    const currentY = snapToGridCoordinate(e.target.y());
    
    // Update target position to snapped coordinates
    e.target.position({ x: currentX, y: currentY });
  }, [isEditable, isDragging, snapToGridCoordinate, doors, dragStart, findNearestWallEdge]);

  // Handle wall drag end
  const handleWallDragEnd = useCallback((e, wallId) => {
    if (!isEditable) return;

    const newX = e.target.x();
    const newY = e.target.y();
    const wall = walls.find(w => w.id === wallId);
    
    if (!wall) return;
    
    const margin = 40;
    
    // Calculate wall length and maintain it
    const deltaX = wall.points[2] - wall.points[0];
    const deltaY = wall.points[3] - wall.points[1];
    const newEndX = newX + deltaX;
    const newEndY = newY + deltaY;
    
    // Constrain to stage bounds
    const constrainedX = Math.max(margin, Math.min(width - margin, newX));
    const constrainedY = Math.max(margin, Math.min(height - margin, newY));
    const constrainedEndX = Math.max(margin, Math.min(width - margin, newEndX));
    const constrainedEndY = Math.max(margin, Math.min(height - margin, newEndY));

    // Update wall position
    const updatedWalls = walls.map(w => 
      w.id === wallId 
        ? { ...w, points: [constrainedX, constrainedY, constrainedEndX, constrainedEndY] }
        : w
    );

    // Reset the dragged element's visual position
    e.target.position({ x: 0, y: 0 });
    
    // Force a re-render
    const stage = e.target.getStage();
    if (stage) {
      stage.batchDraw();
    }

    setWalls(updatedWalls);
    saveToHistory(undefined, updatedWalls, undefined);
    
    // Clear dragging state AFTER updating walls
    setTimeout(() => {
      setIsDragging(false);
      setDragType(null);
    }, 10);
    
    // Trigger update
    setTimeout(() => triggerFloorPlanUpdate(), 20);
  }, [walls, width, height, isEditable, triggerFloorPlanUpdate]);

  // Handle wall endpoint drag
  const handleWallEndpointDragStart = useCallback((e, wallId, endpoint) => {
    if (!isEditable) return;
    
    e.cancelBubble = true;
    
    console.log('Wall endpoint drag start:', wallId, endpoint);
    
    // Set flags to prevent data reload
    setIsDragging(true);
    setIsInternalUpdate(true);
    setDraggingWallEndpoint({ wallId, endpoint });
    setSelectedWall(wallId);
  }, [isEditable]);

  // Helper function to find nearest point on any wall
  const findNearestWallPoint = useCallback((x, y, excludeWallId) => {
    let nearestPoint = null;
    let minDistance = Infinity;
    const snapThreshold = 30; // pixels - increased for better attachment

    // Check all walls except the one being dragged
    walls.forEach(wall => {
      if (wall.id === excludeWallId) return;

      const x1 = wall.points[0];
      const y1 = wall.points[1];
      const x2 = wall.points[2];
      const y2 = wall.points[3];

      // Calculate distance from point to line segment
      const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      if (lineLength === 0) return;

      const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength ** 2)));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);

      const distance = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

      if (distance < minDistance && distance < snapThreshold) {
        minDistance = distance;
        nearestPoint = { x: projX, y: projY, wallId: wall.id };
      }

      // Also check endpoints of other walls
      const dist1 = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
      const dist2 = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);

      if (dist1 < minDistance && dist1 < snapThreshold) {
        minDistance = dist1;
        nearestPoint = { x: x1, y: y1, wallId: wall.id };
      }

      if (dist2 < minDistance && dist2 < snapThreshold) {
        minDistance = dist2;
        nearestPoint = { x: x2, y: y2, wallId: wall.id };
      }
    });

    return nearestPoint;
  }, [walls]);

  const handleWallEndpointDragMove = useCallback((e) => {
    if (!isEditable || !draggingWallEndpoint) return;

    const { wallId, endpoint } = draggingWallEndpoint;

    // Get pointer position from stage ref
    const stage = stageRef.current;
    if (!stage) {
      console.log('Stage ref not available');
      return;
    }
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) {
      console.log('Pointer position not available');
      return;
    }

    let newX = pointerPos.x;
    let newY = pointerPos.y;
    let updatedWallsArray = null;

    // Update wall state using functional setState to avoid stale closure
    setWalls(prevWalls => {
      const wall = prevWalls.find(w => w.id === wallId);
      if (!wall) {
        console.log('Wall not found:', wallId);
        return prevWalls;
      }

      // Try to snap to nearest wall point
      const snapPoint = findNearestWallPoint(newX, newY, wallId);
      if (snapPoint) {
        newX = snapPoint.x;
        newY = snapPoint.y;
        console.log('Snapping to wall:', snapPoint.wallId);
      } else {
        // If not snapping to wall, apply grid snap
        newX = snapToGridCoordinate(newX);
        newY = snapToGridCoordinate(newY);
      }

      const margin = 40;
      // Constrain to stage bounds
      const constrainedX = Math.max(margin, Math.min(width - margin, newX));
      const constrainedY = Math.max(margin, Math.min(height - margin, newY));

      let updatedPoints;
      if (endpoint === 'start') {
        updatedPoints = [constrainedX, constrainedY, wall.points[2], wall.points[3]];
      } else {
        updatedPoints = [wall.points[0], wall.points[1], constrainedX, constrainedY];
      }

      const newWalls = prevWalls.map(w => 
        w.id === wallId ? { ...w, points: updatedPoints } : w
      );
      
      // Capture updated walls for 3D update
      updatedWallsArray = newWalls;
      
      return newWalls;
    });
    
    // Throttle 3D updates to every 100ms during drag for real-time rendering
    const now = Date.now();
    if (now - lastUpdate3D.current > 100 && updatedWallsArray) {
      lastUpdate3D.current = now;
      // Pass the updated walls directly to avoid stale state
      triggerFloorPlanUpdate(true, updatedWallsArray);
    }
  }, [width, height, isEditable, snapToGridCoordinate, draggingWallEndpoint, findNearestWallPoint, triggerFloorPlanUpdate]);

  const handleWallEndpointDragEnd = useCallback(() => {
    if (!draggingWallEndpoint) return;
    
    console.log('Wall endpoint drag ended');
    
    // Mark that user has modified walls
    userModifiedWalls.current = true;
    
    setDraggingWallEndpoint(null);
    saveToHistory();
    
    // Clear dragging flags
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
    
    // Trigger floor plan update after drag completes
    setTimeout(() => {
      triggerFloorPlanUpdate(true); // Allow update during drag cleanup
      // Clear internal update flag after update is sent AND parent has processed
      setTimeout(() => {
        setIsInternalUpdate(false);
        // Allow reload after sufficient time for save to complete
        setTimeout(() => userModifiedWalls.current = false, 2000);
      }, 500);
    }, 50);
  }, [draggingWallEndpoint, triggerFloorPlanUpdate]);

  // Handle room resize (for corners)
  const handleResize = useCallback((roomId, newWidth, newHeight) => {
    if (!isEditable) return;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Apply constraints with minimum size
    const constrainedWidth = Math.max(50, Math.min(newWidth, width - room.x - 10));
    const constrainedHeight = Math.max(50, Math.min(newHeight, height - room.y - 10));

    // Convert back to original coordinates for backend
    const scale = room.scale || 1;
    const originalWidth = constrainedWidth / scale;
    const originalHeight = constrainedHeight / scale;
    const originalX = (room.x - 40) / scale; // margin = 40
    const originalY = (room.y - 40) / scale;

    const updatedRooms = rooms.map(r => 
      r.id === roomId 
        ? { 
            ...r, 
            width: constrainedWidth, 
            height: constrainedHeight,
            originalWidth,
            originalHeight,
            originalX,
            originalY,
            // Preserve other properties
            fill: r.fill || '#bbdefb',
            stroke: r.stroke || '#1976d2',
            strokeWidth: r.strokeWidth || 2
          }
        : r
    );

    setRooms(updatedRooms);
    
    // Save to history for undo/redo
    saveToHistory(updatedRooms, undefined, undefined);

    // Send update to parent component with original coordinates
    if (onRoomUpdate) {
      onRoomUpdate(roomId, {
        x: originalX,
        y: originalY,
        width: originalWidth,
        height: originalHeight
      });
    }
  }, [rooms, isEditable, onRoomUpdate, width, height, saveToHistory]);

  // Handle room selection
  const handleRoomClick = useCallback((e, roomId) => {
    e.cancelBubble = true;
    setSelectedRoom(selectedRoom === roomId ? null : roomId);
    setSelectedDoor(null);
    setSelectedWall(null);
  }, [selectedRoom]);

  // Handle door selection
  const handleDoorClick = useCallback((e, doorId) => {
    e.cancelBubble = true;
    
    if (!isEditable) return;
    
    // If door is already selected, show delete confirmation
    if (selectedDoor === doorId) {
      const confirmed = window.confirm('Delete this door?\n\nPress OK to delete or Cancel to keep it.');
      if (confirmed) {
        const updatedDoors = doors.filter(d => d.id !== doorId);
        console.log('Deleting door:', doorId);
        console.log('Doors before:', doors.length);
        console.log('Doors after:', updatedDoors.length);
        
        // Update local state
        setDoors(updatedDoors);
        setSelectedDoor(null);
        
        // Immediately notify parent with updated data
        if (onFloorPlanUpdate && floorPlanData) {
          const plotWidth = 1000;
          const plotHeight = 1000;
          const margin = 40;
          const scaleX = (width - margin * 2) / plotWidth;
          const scaleY = (height - margin * 2) / plotHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const originalDoors = updatedDoors.map(door => ({
            ...door,
            points: [
              (door.points[0] - margin) / scale,
              (door.points[1] - margin) / scale,
              (door.points[2] - margin) / scale,
              (door.points[3] - margin) / scale
            ],
            x1: (door.points[0] - margin) / scale,
            y1: (door.points[1] - margin) / scale,
            x2: (door.points[2] - margin) / scale,
            y2: (door.points[3] - margin) / scale
          }));
          
          const updatedData = {
            ...floorPlanData,
            doors: originalDoors
          };
          
          setIsInternalUpdate(true);
          onFloorPlanUpdate(updatedData);
          setTimeout(() => setIsInternalUpdate(false), 100);
        }
      }
      return;
    }
    
    // Otherwise, select the door
    setSelectedDoor(doorId);
    setSelectedRoom(null);
    setSelectedWall(null);
  }, [selectedDoor, isEditable, doors, triggerFloorPlanUpdate]);

  // Handle wall selection
  const handleWallClick = useCallback((e, wallId) => {
    e.cancelBubble = true;
    
    if (!isEditable) return;
    
    // If wall is already selected, show delete confirmation
    if (selectedWall === wallId) {
      const confirmed = window.confirm('Delete this wall?\n\nPress OK to delete or Cancel to keep it.');
      if (confirmed) {
        const updatedWalls = walls.filter(w => w.id !== wallId);
        console.log('Deleting wall:', wallId);
        console.log('Walls before:', walls.length);
        console.log('Walls after:', updatedWalls.length);
        
        // Update local state
        setWalls(updatedWalls);
        setSelectedWall(null);
        
        // Immediately notify parent with updated data
        if (onFloorPlanUpdate && floorPlanData) {
          const plotWidth = 1000;
          const plotHeight = 1000;
          const margin = 40;
          const scaleX = (width - margin * 2) / plotWidth;
          const scaleY = (height - margin * 2) / plotHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const originalWalls = updatedWalls.map(wall => ({
            ...wall,
            points: [
              (wall.points[0] - margin) / scale,
              (wall.points[1] - margin) / scale,
              (wall.points[2] - margin) / scale,
              (wall.points[3] - margin) / scale
            ],
            x1: (wall.points[0] - margin) / scale,
            y1: (wall.points[1] - margin) / scale,
            x2: (wall.points[2] - margin) / scale,
            y2: (wall.points[3] - margin) / scale
          }));
          
          const updatedData = {
            ...floorPlanData,
            walls: originalWalls
          };
          
          setIsInternalUpdate(true);
          onFloorPlanUpdate(updatedData);
          setTimeout(() => setIsInternalUpdate(false), 100);
        }
      }
      return;
    }
    
    // Otherwise, select the wall
    setSelectedWall(wallId);
    setSelectedRoom(null);
    setSelectedDoor(null);
  }, [selectedWall, isEditable, walls, triggerFloorPlanUpdate]);

  // Handle stage click (deselect)
  const handleStageClick = useCallback((e) => {
    if (!isEditable) return;
    
    // Check if clicked on empty area
    if (e.target === e.target.getStage()) {
      const pos = e.target.getPointerPosition();
      const snappedX = snapToGridCoordinate(pos.x);
      const snappedY = snapToGridCoordinate(pos.y);
      
      if (creationMode === 'room') {
        if (!isCreating) {
          // Start creating room
          setNewElementStart({ x: snappedX, y: snappedY });
          setIsCreating(true);
        } else {
          // Complete room creation
          const width = Math.abs(snappedX - newElementStart.x);
          const height = Math.abs(snappedY - newElementStart.y);
          const x = Math.min(snappedX, newElementStart.x);
          const y = Math.min(snappedY, newElementStart.y);
          
          const baseRoom = {
            id: `created-room-${Date.now()}`,
            x: x,
            y: y,
            width: width,
            height: height,
            fill: '#bbdefb',
            stroke: '#1976d2',
            strokeWidth: 2,
            draggable: isEditable,
            type: 'Room',
            tag: 'room',
            name: 'New Room',
            source: 'local', // Mark as locally created
            originalX: (x - margin) / scale, // Use proper scale factor
            originalY: (y - margin) / scale,
            originalWidth: width / scale,
            originalHeight: height / scale,
            scale: scale
          };
          
          // Calculate percentage based on drawn area (use original coordinates)
          const originalDrawnArea = (width / scale) * (height / scale);
          const requestedPercentage = (originalDrawnArea / totalFloorArea) * 100;
          
          // Use area allocation system
          const roomWithArea = addRoomWithAreaAllocation(baseRoom, requestedPercentage);
          setRooms(prev => {
            const newRooms = [...prev, roomWithArea];
            // Track room creation time and set internal update flag
            setIsInternalUpdate(true);
            setTimeout(() => setIsInternalUpdate(false), 2000); // Longer delay for room creation
            
            // Save to history after state update
            setTimeout(() => saveToHistory(newRooms, undefined, undefined), 0);
            // Trigger update using the proper update function
            setTimeout(() => {
              triggerFloorPlanUpdate(true); // Allow update even during potential drag state
            }, 0);
            return newRooms;
          });
          setSelectedRoom(baseRoom.id);
          setIsCreating(false);
          setNewElementStart(null);
          setCreationMode(null);
        }
      } else if (creationMode === 'door') {
        if (!isCreating) {
          // Start creating door
          setNewElementStart({ x: snappedX, y: snappedY });
          setIsCreating(true);
        } else {
          // Complete door creation
          const newDoor = {
            id: `created-door-${Date.now()}`,
            points: [newElementStart.x, newElementStart.y, snappedX, snappedY],
            stroke: '#8B4513',
            strokeWidth: 6,
            lineCap: 'round'
          };
          setDoors(prev => {
            const newDoors = [...prev, newDoor];
            // Save to history after state update
            setTimeout(() => saveToHistory(undefined, undefined, newDoors), 0);
            return newDoors;
          });
          setSelectedDoor(newDoor.id);
          setIsCreating(false);
          // Trigger update after state change
          setTimeout(() => triggerFloorPlanUpdate(), 0);
          setNewElementStart(null);
          setCreationMode(null);
        }
      } else {
        // Normal click - deselect all
        setSelectedRoom(null);
        setSelectedDoor(null);
        setSelectedWall(null);
      }
    }
  }, [isEditable, creationMode, isCreating, newElementStart, snapToGridCoordinate]);

  // Resize handle component
  const ResizeHandle = ({ x, y, onDrag, cursor = 'nw-resize' }) => (
    <Rect
      x={x - 4}
      y={y - 4}
      width={8}
      height={8}
      fill="#2196F3"
      stroke="#1976D2"
      strokeWidth={1}
      draggable={isEditable}
      onDragMove={onDrag}
      style={{ cursor }}
    />
  );

  return (
    <div className="flex bg-gray-50">
      {/* Left Sidebar - Creation Tools */}
      {isEditable && (
        <div className="w-64 bg-white border-r border-gray-300 p-4 space-y-4 overflow-y-auto">
          {/* Creation Tools Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-black mb-3">
              🔨 Creation Tools
            </div>
            
            <div className="space-y-2">
              {/* Add Door Button */}
              <button
                onClick={() => {
                  if (creationMode === 'door') {
                    setCreationMode(null);
                    setIsCreating(false);
                    setNewElementStart(null);
                  } else {
                    setCreationMode('door');
                    setIsCreating(false);
                    setNewElementStart(null);
                  }
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg border transition-colors ${
                  creationMode === 'door'
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                {creationMode === 'door' ? '✓ Click to Place Door' : '🚪 Add Door'}
              </button>
              
              {/* Add Wall Button */}
              <button
                onClick={addNewWall}
                className="w-full px-3 py-2 text-xs rounded-lg border transition-colors bg-white border-gray-300 text-black hover:bg-gray-50"
              >
                🧱 Add Wall
              </button>
              
              {/* Add Room Button */}
              <button
                onClick={() => {
                  if (creationMode === 'room') {
                    setCreationMode(null);
                    setIsCreating(false);
                    setNewElementStart(null);
                  } else {
                    setCreationMode('room');
                    setIsCreating(false);
                    setNewElementStart(null);
                  }
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg border transition-colors ${
                  creationMode === 'room'
                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                    : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                {creationMode === 'room' ? '✓ Click to Place Room' : '🏠 Add Room'}
              </button>

              {/* Quick Add Buttons */}
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-black mb-2">Quick Add:</div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      // Calculate proper scaling for quick add
                      const plotWidth = 1000;
                      const plotHeight = 1000;
                      const margin = 40;
                      const scaleX = (width - margin * 2) / plotWidth;
                      const scaleY = (height - margin * 2) / plotHeight;
                      const scale = Math.min(scaleX, scaleY);
                      
                      const baseRoom = {
                        id: `new-room-${Date.now()}`,
                        x: 200,
                        y: 200,
                        width: 150,
                        height: 100,
                        fill: '#bbdefb',
                        stroke: '#1976d2',
                        strokeWidth: 2,
                        draggable: isEditable,
                        type: 'Room',
                        tag: 'room',
                        name: 'New Room',
                        source: 'local', // Mark as locally created
                        originalX: (200 - margin) / scale,
                        originalY: (200 - margin) / scale,
                        originalWidth: 150 / scale,
                        originalHeight: 100 / scale,
                        scale: scale
                      };
                      
                      // Use area allocation system
                      const roomWithArea = addRoomWithAreaAllocation(baseRoom, 20); // Request 20% default
                      setRooms(prev => {
                        const newRooms = [...prev, roomWithArea];
                        // Set internal update flag to prevent backend override
                        setIsInternalUpdate(true);
                        setTimeout(() => setIsInternalUpdate(false), 2000);
                        
                        // Save to history after room creation
                        setTimeout(() => saveToHistory(newRooms, undefined, undefined), 0);
                        // Trigger proper floor plan update
                        setTimeout(() => {
                          triggerFloorPlanUpdate(true);
                        }, 0);
                        return newRooms;
                      });
                      setSelectedRoom(baseRoom.id);
                      setSelectedDoor(null);
                      setSelectedWall(null);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 border border-blue-300 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    title="Add room at center"
                  >
                    + Room
                  </button>
                  <button
                    onClick={addNewDoor}
                    className="px-2 py-1 text-xs bg-amber-100 border border-amber-300 text-amber-800 rounded hover:bg-amber-200 transition-colors"
                    title="Add door at center"
                  >
                    + Door
                  </button>
                  <button
                    onClick={addNewWall}
                    className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 text-slate-800 rounded hover:bg-slate-200 transition-colors"
                    title="Add wall at center"
                  >
                    + Wall
                  </button>
                </div>
              </div>
              
              {/* Creation Instructions */}
              {creationMode && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                  {isCreating 
                    ? `Click to finish ${creationMode}` 
                    : `Click to start ${creationMode}, then click again to finish`
                  }
                </div>
              )}
              
              {/* Cancel Button */}
              {(creationMode || isCreating) && (
                <button
                  onClick={() => {
                    setCreationMode(null);
                    setIsCreating(false);
                    setNewElementStart(null);
                  }}
                  className="w-full px-3 py-1 text-xs bg-red-100 border border-red-300 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Room Customization Panel */}
          {selectedRoom && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-medium text-black mb-3">
                🏠 Customize Room
              </div>
              
              <div className="space-y-3">
                {/* Room Type */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Room Type
                  </label>
                  <select
                    value={rooms.find(r => r.id === selectedRoom)?.type || 'Room'}
                    onChange={(e) => {
                      const updatedRooms = rooms.map(room => 
                        room.id === selectedRoom 
                          ? { 
                              ...room, 
                              type: e.target.value,
                              fill: getRoomColor(e.target.value),
                              name: room.name || getRoomName(e.target.value)
                            }
                          : room
                      );
                      setRooms(updatedRooms);
                      saveToHistory(updatedRooms, undefined, undefined);
                    }}
                    className="w-full px-2 py-1 text-xs border border-blue-300 rounded bg-blue-50 text-blue-900 focus:border-blue-500 focus:bg-white"
                  >
                    <option value="livingroom">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="drawingroom">Drawing Room</option>
                    <option value="carporch">Car Porch</option>
                    <option value="garden">Garden</option>
                    <option value="Room">Other</option>
                  </select>
                </div>

                {/* Room Name */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={rooms.find(r => r.id === selectedRoom)?.name || ''}
                    onChange={(e) => {
                      const updatedRooms = rooms.map(room => 
                        room.id === selectedRoom 
                          ? { ...room, name: e.target.value }
                          : room
                      );
                      setRooms(updatedRooms);
                    }}
                    onBlur={() => saveToHistory()}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="Enter room name"
                  />
                </div>
                
                {/* Room Fill Color */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Room Fill Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={rooms.find(r => r.id === selectedRoom)?.fill || '#bbdefb'}
                      onChange={(e) => customizeRoom('fill', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={rooms.find(r => r.id === selectedRoom)?.fill || '#bbdefb'}
                      onChange={(e) => customizeRoom('fill', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#bbdefb"
                    />
                  </div>
                </div>
                
                {/* Room Border Color */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Room Border Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={rooms.find(r => r.id === selectedRoom)?.stroke || '#1976d2'}
                      onChange={(e) => customizeRoom('stroke', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={rooms.find(r => r.id === selectedRoom)?.stroke || '#1976d2'}
                      onChange={(e) => customizeRoom('stroke', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#1976d2"
                    />
                  </div>
                </div>
                
                {/* Room Border Width */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Border Width: {rooms.find(r => r.id === selectedRoom)?.strokeWidth || 2}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rooms.find(r => r.id === selectedRoom)?.strokeWidth || 2}
                    onChange={(e) => customizeRoom('strokeWidth', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {/* Room Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                  <div className="font-medium text-blue-900 mb-2">💡 How to customize:</div>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Drag room to move position</li>
                    <li>• Use blue handles to resize</li>
                    <li>• Adjust colors and border width above</li>
                    <li>• Use Ctrl+Z/Ctrl+Y to undo/redo</li>
                    <li>• Press Delete key to remove room</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Door/Wall Customization Panel */}
          {(selectedDoor || selectedWall) && !selectedRoom && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-medium text-black mb-3">
                🎨 Customize {selectedDoor ? 'Door' : 'Wall'}
              </div>
              
              {selectedDoor && (
                <div className="space-y-3">
                  {/* Door Color */}
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">
                      Door Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={doors.find(d => d.id === selectedDoor)?.stroke || doorColor}
                        onChange={(e) => customizeDoor('stroke', e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={doors.find(d => d.id === selectedDoor)?.stroke || doorColor}
                        onChange={(e) => customizeDoor('stroke', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#8B4513"
                      />
                    </div>
                  </div>
                  
                  {/* Door Width */}
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">
                      Door Width: {doors.find(d => d.id === selectedDoor)?.strokeWidth || doorWidth}px
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="15"
                      value={doors.find(d => d.id === selectedDoor)?.strokeWidth || doorWidth}
                      onChange={(e) => customizeDoor('strokeWidth', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {selectedWall && (
                <div className="space-y-3">
                  {/* Wall Color */}
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">
                      Wall Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={walls.find(w => w.id === selectedWall)?.stroke || wallColor}
                        onChange={(e) => customizeWall('stroke', e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={walls.find(w => w.id === selectedWall)?.stroke || wallColor}
                        onChange={(e) => customizeWall('stroke', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
                  {/* Wall Width */}
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">
                      Wall Width: {walls.find(w => w.id === selectedWall)?.strokeWidth || wallWidth}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={walls.find(w => w.id === selectedWall)?.strokeWidth || wallWidth}
                      onChange={(e) => customizeWall('strokeWidth', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Wall Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                    <div className="font-medium text-blue-900 mb-2">💡 How to customize:</div>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Drag the endpoint circles to move/resize</li>
                      <li>• Drag either end to adjust position & length</li>
                      <li>• Click twice to delete</li>
                      <li>• Use Ctrl+Z/Ctrl+Y to undo/redo</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Element Count Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-black mb-2">
              🏗️ Elements
            </div>
            <div className="space-y-1 text-xs text-black">
              <div className="flex justify-between">
                <span>Rooms:</span>
                <span>{rooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Doors:</span>
                <span>{doors.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Walls:</span>
                <span>{walls.length}</span>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-black mb-2">
              ⚙️ Settings
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="snapToGrid"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="w-3 h-3"
                />
                <label htmlFor="snapToGrid" className="text-xs text-black">
                  Snap to Grid ({gridSize}px)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Floor Plan Area */}
      <div className="flex-1 relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Canvas */}
        <Stage
          width={width}
          height={height}
          ref={stageRef}
          onClick={handleStageClick}
          onMouseMove={(e) => {
            handleStageMouseMove(e);
            if (draggingWallEndpoint) {
              handleWallEndpointDragMove(e);
            }
          }}
          onMouseUp={(e) => {
            if (draggingWallEndpoint) {
              handleWallEndpointDragEnd();
            }
          }}
          onMouseLeave={(e) => {
            if (draggingWallEndpoint) {
              handleWallEndpointDragEnd();
            }
          }}
          className={`cursor-${creationMode ? 'crosshair' : 'default'}`}
        >
        <Layer>
          {/* White background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#FFFFFF"
          />
          
          {/* Grid background */}
          {isEditable && (
            <>
              {/* Vertical grid lines */}
              {Array.from({ length: Math.floor(width / 25) + 1 }, (_, i) => (
                <Line
                  key={`v-grid-${i}`}
                  points={[i * 25, 0, i * 25, height]}
                  stroke="#E8E8E8"
                  strokeWidth={0.5}
                  opacity={0.6}
                />
              ))}
              {/* Horizontal grid lines */}
              {Array.from({ length: Math.floor(height / 25) + 1 }, (_, i) => (
                <Line
                  key={`h-grid-${i}`}
                  points={[0, i * 25, width, i * 25]}
                  stroke="#E8E8E8"
                  strokeWidth={0.5}
                  opacity={0.6}
                />
              ))}
            </>
          )}

          {/* Outer boundary - professional border */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            stroke="#1e2a3a"
            strokeWidth={4}
          />
          
          {/* Inner plot boundary */}
          <Rect
            x={4}
            y={4}
            width={width - 8}
            height={height - 8}
            fill="transparent"
            stroke="#ED7600"
            strokeWidth={2}
            dash={[8, 4]}
            opacity={0.7}
          />

          {/* Rooms */}
          {rooms.map(room => (
            <Group key={room.id}>
              {/* Room rectangle */}
              <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={room.fill || '#bbdefb'}
                opacity={0.8}
                stroke={selectedRoom === room.id ? '#2196F3' : (room.stroke || '#1976d2')}
                strokeWidth={selectedRoom === room.id ? 3 : (room.strokeWidth || 2)}
                draggable={room.draggable}
                onDragStart={(e) => handleRoomDragStart(e, room.id)}
                onDragMove={(e) => handleRoomDragMove(e, room.id)}
                onDragEnd={(e) => handleRoomDragEnd(e, room.id)}
                onClick={(e) => handleRoomClick(e, room.id)}
                style={{ cursor: isEditable ? 'move' : 'default' }}
                shadowBlur={selectedRoom === room.id ? 10 : 0}
                shadowColor="rgba(33, 150, 243, 0.5)"
              />

              {/* Room label */}
              <Text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 - 10}
                text={room.name}
                fontSize={Math.min(16, Math.max(10, Math.min(room.width, room.height) / 8))}
                fontFamily="Arial"
                fontStyle="bold"
                fill="#333"
                align="center"
                verticalAlign="middle"
                width={room.width}
                listening={false}
              />

              {/* Room dimensions */}
              <Text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 10}
                text={`${Math.round(room.width)}×${Math.round(room.height)}`}
                fontSize={Math.min(12, Math.max(8, Math.min(room.width, room.height) / 12))}
                fontFamily="Arial"
                fill="#666"
                align="center"
                verticalAlign="middle"
                width={room.width}
                listening={false}
              />

              {/* Resize handles for selected room */}
              {selectedRoom === room.id && isEditable && (
                <>
                  {/* Bottom-right corner handle */}
                  <Rect
                    x={room.x + room.width - 4}
                    y={room.y + room.height - 4}
                    width={8}
                    height={8}
                    fill="#2196F3"
                    stroke="#1976D2"
                    strokeWidth={1}
                    draggable={true}
                    onDragStart={() => {
                      setIsDragging(true);
                      setDragType('resize');
                    }}
                    onDragMove={(e) => {
                      const newWidth = e.target.x() - room.x + 4;
                      const newHeight = e.target.y() - room.y + 4;
                      handleResize(room.id, newWidth, newHeight);
                    }}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setDragType(null);
                    }}
                    style={{ cursor: 'se-resize' }}
                  />
                  
                  {/* Right edge handle */}
                  <Rect
                    x={room.x + room.width - 4}
                    y={room.y + room.height / 2 - 4}
                    width={8}
                    height={8}
                    fill="#2196F3"
                    stroke="#1976D2"
                    strokeWidth={1}
                    draggable={true}
                    dragBoundFunc={(pos) => ({
                      x: Math.max(room.x + 50, Math.min(pos.x, width - 10)),
                      y: room.y + room.height / 2 - 4
                    })}
                    onDragStart={() => {
                      setIsDragging(true);
                      setDragType('resize');
                    }}
                    onDragMove={(e) => {
                      const newWidth = e.target.x() - room.x + 4;
                      handleResize(room.id, newWidth, room.height);
                    }}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setDragType(null);
                    }}
                    style={{ cursor: 'ew-resize' }}
                  />
                  
                  {/* Bottom edge handle */}
                  <Rect
                    x={room.x + room.width / 2 - 4}
                    y={room.y + room.height - 4}
                    width={8}
                    height={8}
                    fill="#2196F3"
                    stroke="#1976D2"
                    strokeWidth={1}
                    draggable={true}
                    dragBoundFunc={(pos) => ({
                      x: room.x + room.width / 2 - 4,
                      y: Math.max(room.y + 50, Math.min(pos.y, height - 10))
                    })}
                    onDragStart={() => {
                      setIsDragging(true);
                      setDragType('resize');
                    }}
                    onDragMove={(e) => {
                      const newHeight = e.target.y() - room.y + 4;
                      handleResize(room.id, room.width, newHeight);
                    }}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setDragType(null);
                    }}
                    style={{ cursor: 'ns-resize' }}
                  />
                </>
              )}
            </Group>
          ))}

          {/* Walls - render on top of rooms */}
          {walls.map(wall => (
            <Group key={wall.id} draggable={false}>
              <Line
                points={wall.points}
                stroke={selectedWall === wall.id ? '#2196F3' : wall.stroke}
                strokeWidth={selectedWall === wall.id ? wall.strokeWidth + 2 : wall.strokeWidth}
                lineCap={wall.lineCap}
                draggable={false}
                onClick={(e) => {
                  e.cancelBubble = true;
                  handleWallClick(e, wall.id);
                }}
                style={{ cursor: isEditable ? 'pointer' : 'default' }}
              />
              {/* Wall endpoint handles - always visible for easy adjustment */}
              {isEditable && (
                <>
                  {/* Start point handle */}
                  <Circle
                    x={wall.points[0]}
                    y={wall.points[1]}
                    radius={selectedWall === wall.id ? 8 : 5}
                    fill={selectedWall === wall.id ? "#2196F3" : "#757575"}
                    stroke={selectedWall === wall.id ? "#1976D2" : "#424242"}
                    strokeWidth={2}
                    onMouseDown={(e) => {
                      e.cancelBubble = true;
                      handleWallEndpointDragStart(e, wall.id, 'start');
                    }}
                    listening={true}
                    style={{ cursor: 'grab' }}
                    opacity={selectedWall === wall.id ? 1 : 0.7}
                  />
                  {/* Visual snap indicator for start point */}
                  {draggingWallEndpoint?.wallId === wall.id && draggingWallEndpoint?.endpoint === 'start' && (
                    <Circle
                      x={wall.points[0]}
                      y={wall.points[1]}
                      radius={30}
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dash={[5, 5]}
                      opacity={0.5}
                    />
                  )}
                  {/* End point handle */}
                  <Circle
                    x={wall.points[2]}
                    y={wall.points[3]}
                    radius={selectedWall === wall.id ? 8 : 5}
                    fill={selectedWall === wall.id ? "#2196F3" : "#757575"}
                    stroke={selectedWall === wall.id ? "#1976D2" : "#424242"}
                    strokeWidth={2}
                    onMouseDown={(e) => {
                      e.cancelBubble = true;
                      handleWallEndpointDragStart(e, wall.id, 'end');
                    }}
                    listening={true}
                    style={{ cursor: 'grab' }}
                    opacity={selectedWall === wall.id ? 1 : 0.7}
                  />
                  {/* Visual snap indicator for end point */}
                  {draggingWallEndpoint?.wallId === wall.id && draggingWallEndpoint?.endpoint === 'end' && (
                    <Circle
                      x={wall.points[2]}
                      y={wall.points[3]}
                      radius={30}
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dash={[5, 5]}
                      opacity={0.5}
                    />
                  )}
                </>
              )}
            </Group>
          ))}

          {/* Doors - render on top */}
          {doors.map(door => {
            const x1 = door.points[0];
            const y1 = door.points[1];
            const x2 = door.points[2];
            const y2 = door.points[3];
            
            const isSelected = selectedDoor === door.id;
            
            return (
              <Group key={door.id}>
                {/* Simple door - bold brown line */}
                <Line
                  points={[x1, y1, x2, y2]}
                  stroke={isSelected ? "#2196F3" : "#8B4513"}
                  strokeWidth={Math.max(8, door.strokeWidth * 2)}
                  lineCap="round"
                  draggable={isEditable}
                  onDragStart={(e) => handleDoorDragStart(e, door.id)}
                  onDragMove={(e) => handleDoorDragMove(e, door.id)}
                  onDragEnd={(e) => handleDoorDragEnd(e, door.id)}
                  onClick={(e) => handleDoorClick(e, door.id)}
                  style={{ cursor: isEditable ? 'move' : 'default' }}
                />
                
                {/* Door selection indicators */}
                {isSelected && isEditable && (
                  <>
                    {/* Start point handle */}
                    <Circle
                      x={x1}
                      y={y1}
                      radius={6}
                      fill="#2196F3"
                      stroke="#1976D2"
                      strokeWidth={2}
                      draggable={true}
                      style={{ cursor: 'move' }}
                    />
                    {/* End point handle */}
                    <Circle
                      x={x2}
                      y={y2}
                      radius={6}
                      fill="#2196F3"
                      stroke="#1976D2"
                      strokeWidth={2}
                      draggable={true}
                      style={{ cursor: 'move' }}
                    />
                  </>
                )}
              </Group>
            );
          })}

          {/* Creation preview */}
          {isCreating && newElementStart && (
            <>
              {creationMode === 'room' ? (
                <Rect
                  x={Math.min(newElementStart.x, stageRef.current?.getPointerPosition()?.x || newElementStart.x)}
                  y={Math.min(newElementStart.y, stageRef.current?.getPointerPosition()?.y || newElementStart.y)}
                  width={Math.abs((stageRef.current?.getPointerPosition()?.x || newElementStart.x) - newElementStart.x)}
                  height={Math.abs((stageRef.current?.getPointerPosition()?.y || newElementStart.y) - newElementStart.y)}
                  fill="rgba(227, 242, 253, 0.5)"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              ) : (
                <Line
                  points={[
                    newElementStart.x, 
                    newElementStart.y, 
                    stageRef.current?.getPointerPosition()?.x || newElementStart.x,
                    stageRef.current?.getPointerPosition()?.y || newElementStart.y
                  ]}
                  stroke={creationMode === 'door' ? '#4CAF50' : creationMode === 'wall' ? '#2196F3' : '#9C27B0'}
                  strokeWidth={creationMode === 'door' ? 6 : 4}
                  lineCap="round"
                  dash={[5, 5]}
                  opacity={0.7}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>

      {/* Selection Info - moved to bottom right of floor plan area */}
      {(selectedRoom || selectedDoor || selectedWall) && (
        <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-xs">
          {selectedRoom && (
            <>
              <div className="text-sm font-medium text-black flex items-center">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                Room: {rooms.find(r => r.id === selectedRoom)?.name || selectedRoom}
              </div>
              <div className="text-xs text-black mt-1">
                Position: ({Math.round(rooms.find(r => r.id === selectedRoom)?.x || 0)}, {Math.round(rooms.find(r => r.id === selectedRoom)?.y || 0)})
              </div>
              <div className="text-xs text-black">
                Size: {Math.round(rooms.find(r => r.id === selectedRoom)?.width || 0)}×{Math.round(rooms.find(r => r.id === selectedRoom)?.height || 0)}
              </div>
            </>
          )}
          
          {selectedDoor && (
            <>
              <div className="text-sm font-medium text-black flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
                </svg>
                Door: {selectedDoor}
              </div>
              <div className="text-xs text-black mt-1">
                Start: ({Math.round(doors.find(d => d.id === selectedDoor)?.points[0] || 0)}, {Math.round(doors.find(d => d.id === selectedDoor)?.points[1] || 0)})
              </div>
              <div className="text-xs text-black">
                End: ({Math.round(doors.find(d => d.id === selectedDoor)?.points[2] || 0)}, {Math.round(doors.find(d => d.id === selectedDoor)?.points[3] || 0)})
              </div>
            </>
          )}
          
          {selectedWall && (
            <>
              <div className="text-sm font-medium text-black flex items-center">
                <div className="w-4 h-1 bg-gray-600 mr-2"></div>
                Wall: {selectedWall}
              </div>
              <div className="text-xs text-black mt-1">
                Start: ({Math.round(walls.find(w => w.id === selectedWall)?.points[0] || 0)}, {Math.round(walls.find(w => w.id === selectedWall)?.points[1] || 0)})
              </div>
              <div className="text-xs text-black">
                End: ({Math.round(walls.find(w => w.id === selectedWall)?.points[2] || 0)}, {Math.round(walls.find(w => w.id === selectedWall)?.points[3] || 0)})
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default KonvaFloorPlan;
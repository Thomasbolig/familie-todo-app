'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [timePeriod, setTimePeriod] = useState('3dager');
  // Section-specific person filters - each section can have multiple people selected
  const [sectionFilters, setSectionFilters] = useState({
    tasks: ['alle'], // Array to support multiple selections
    workSchool: ['alle'],
    leisure: ['alle']
  });
  const [showUserTasks, setShowUserTasks] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Emma', emoji: '👧', color: '#fef3c7', borderColor: '#f59e0b', role: 'barn', profileImage: null },
    { id: 2, name: 'Oliver', emoji: '👦', color: '#dbeafe', borderColor: '#3b82f6', role: 'barn', profileImage: null },
    { id: 3, name: 'Mor', emoji: '👩', color: '#f3e8ff', borderColor: '#8b5cf6', role: 'mor', profileImage: null },
    { id: 4, name: 'Far', emoji: '👨', color: '#e0f2fe', borderColor: '#0284c7', role: 'far', profileImage: null }
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  // Family group setup state
  const [hasFamily, setHasFamily] = useState(false); // false = no family setup yet
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  const [familyGroupName, setFamilyGroupName] = useState('');
  const [showInviteMembers, setShowInviteMembers] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('mor'); // The logged-in user's role

  // In-app notification system for family invites
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Notification button positioning
  const [notificationButtonPosition, setNotificationButtonPosition] = useState('right'); // 'left' or 'right'

  // Edit family member state
  const [showEditMember, setShowEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    emoji: '',
    color: '',
    borderColor: ''
  });

  // Simulated user database for checking if phone numbers exist
  const existingUsers = [
    { phone: '+47 123 45 678', name: 'Emma Hansen', role: 'mor' },
    { phone: '+47 987 65 432', name: 'Oliver Nilsen', role: 'far' },
    { phone: '+47 555 12 345', name: 'Anna Larsen', role: 'barn' },
    { phone: '+47 111 22 333', name: 'Test User', role: 'far' }
  ];

  // Custody arrangement configuration
  const [custodyConfig, setCustodyConfig] = useState({
    arrangement: 'alternating_weeks', // alternating_weeks, alternating_weekends, every_third_weekend, alternating_long_weekends
    handoverDays: ['friday'], // Array of handover days for multi-day exchanges
    handoverTimes: ['15:00'], // Corresponding times for each handover day
    startsWith: 'mor' // mor, far - who starts the cycle
  });

  // Packing tasks state
  const [packingTasks, setPackingTasks] = useState([]);

  // Persistent packing template state
  const [packingTemplate, setPackingTemplate] = useState([
    { id: 1, item: 'Klær til {days} dager', category: 'klær', enabled: true },
    { id: 2, item: 'Undertøy og sokker', category: 'klær', enabled: true },
    { id: 3, item: 'Nattøy', category: 'klær', enabled: true },
    { id: 4, item: 'Tannbørste og tannkrem', category: 'hygiene', enabled: true },
    { id: 5, item: 'Shampoo og dusj-såpe', category: 'hygiene', enabled: true },
    { id: 6, item: 'Hårbørste/kam', category: 'hygiene', enabled: true },
    { id: 7, item: 'Favorittdyret/bamse', category: 'leker', enabled: true },
    { id: 8, item: 'Bøker eller leker', category: 'leker', enabled: true },
    { id: 9, item: 'Skoletøy og sekk', category: 'skole', enabled: true },
    { id: 10, item: 'Hjemmelekser og bøker', category: 'skole', enabled: true },
    { id: 11, item: 'Medisiner (hvis nødvendig)', category: 'helse', enabled: false },
    { id: 12, item: 'Mobillader', category: 'teknologi', enabled: true }
  ]);
  const [newPackingItem, setNewPackingItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('klær');

  // Helper functions for managing multiple handover days
  const addHandoverDay = () => {
    const newDay = 'monday'; // Default new day
    const newTime = '15:00'; // Default new time
    setCustodyConfig(prev => ({
      ...prev,
      handoverDays: [...prev.handoverDays, newDay],
      handoverTimes: [...prev.handoverTimes, newTime]
    }));
  };

  const removeHandoverDay = (dayToRemove) => {
    const index = custodyConfig.handoverDays.indexOf(dayToRemove);
    if (index > -1) {
      setCustodyConfig(prev => ({
        ...prev,
        handoverDays: prev.handoverDays.filter((_, i) => i !== index),
        handoverTimes: prev.handoverTimes.filter((_, i) => i !== index)
      }));
    }
  };

  const updateHandoverDay = (index, newDay) => {
    setCustodyConfig(prev => ({
      ...prev,
      handoverDays: prev.handoverDays.map((day, i) => i === index ? newDay : day)
    }));
  };

  const updateHandoverTime = (index, newTime) => {
    setCustodyConfig(prev => ({
      ...prev,
      handoverTimes: prev.handoverTimes.map((time, i) => i === index ? newTime : time)
    }));
  };

  // Auto-configure handover days based on arrangement
  const autoConfigureHandoverDays = (arrangement) => {
    let defaultConfig = { handoverDays: ['friday'], handoverTimes: ['15:00'] };

    switch (arrangement) {
      case 'alternating_weeks':
        defaultConfig = { handoverDays: ['friday'], handoverTimes: ['15:00'] };
        break;
      case 'alternating_weekends':
        defaultConfig = { handoverDays: ['friday', 'sunday'], handoverTimes: ['17:00', '18:00'] };
        break;
      case 'every_third_weekend':
        defaultConfig = { handoverDays: ['friday', 'sunday'], handoverTimes: ['17:00', '18:00'] };
        break;
      case 'alternating_long_weekends':
        defaultConfig = { handoverDays: ['wednesday', 'sunday'], handoverTimes: ['16:00', '18:00'] };
        break;
    }

    setCustodyConfig(prev => ({
      ...prev,
      arrangement,
      handoverDays: defaultConfig.handoverDays,
      handoverTimes: defaultConfig.handoverTimes
    }));
  };

  // Family group setup functions
  const createFamilyGroup = () => {
    if (familyGroupName.trim()) {
      setHasFamily(true);
      setShowFamilySetup(false);
      setFamilyGroupName('');

      // Clear demo data and set up real family with current user
      const currentUserName = currentUserRole === 'mor' ? 'Mor' : 'Far';
      const currentUserEmoji = currentUserRole === 'mor' ? '👩' : '👨';

      setFamilyMembers([{
        id: 1,
        name: currentUserName,
        emoji: currentUserEmoji,
        color: currentUserRole === 'mor' ? '#f3e8ff' : '#e0f2fe',
        borderColor: currentUserRole === 'mor' ? '#8b5cf6' : '#0284c7',
        role: currentUserRole,
        profileImage: null
      }]);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Norwegian phone number validation (simple)
    const cleanPhone = phone.replace(/\s/g, '');
    return /^(\+47|0047)?[0-9]{8}$/.test(cleanPhone) || /^\+[1-9]\d{1,14}$/.test(cleanPhone);
  };

  // Helper functions for notification system
  const findExistingUser = (phone) => {
    const cleanPhone = phone.replace(/\s/g, '');
    return existingUsers.find(user => user.phone.replace(/\s/g, '') === cleanPhone);
  };

  const sendInAppNotification = (user, fromUser, familyGroupName) => {
    const notification = {
      id: Date.now(),
      type: 'family_invite',
      from: fromUser,
      familyGroupName: familyGroupName,
      message: `${fromUser} inviterte deg til å bli med i familiegruppen "${familyGroupName}"`,
      createdAt: new Date().toISOString(),
      read: false
    };

    // In a real app, this would send to the user's notification queue
    // For demo purposes, we'll add it to our local notifications if it's for current user
    if (user.phone === '+47 111 22 333') { // Demo: simulate receiving notification
      setNotifications(prev => [...prev, notification]);
    }

    return notification;
  };

  const handleNotificationAction = (notificationId, action) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, read: true, action: action }
        : notif
    ));

    if (action === 'accept') {
      // In a real app, this would join the family group
      alert('Familiegruppe invitasjon akseptert! Du er nå medlem av gruppen.');
    } else if (action === 'decline') {
      alert('Familiegruppe invitasjon avslått.');
    }
  };

  // Edit family member functions
  const openEditMember = (member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      role: member.role,
      emoji: member.emoji,
      color: member.color,
      borderColor: member.borderColor
    });
    setShowEditMember(true);
  };

  const closeEditMember = () => {
    setShowEditMember(false);
    setEditingMember(null);
    setEditForm({
      name: '',
      role: '',
      emoji: '',
      color: '',
      borderColor: ''
    });
  };

  const saveEditMember = () => {
    if (!editForm.name.trim()) {
      alert('Navn er påkrevd');
      return;
    }

    // Get the appropriate emoji and colors for the role
    const getRoleDefaults = (role) => {
      switch (role) {
        case 'mor':
          return { emoji: '👩', color: '#f3e8ff', borderColor: '#8b5cf6' };
        case 'far':
          return { emoji: '👨', color: '#e0f2fe', borderColor: '#0284c7' };
        case 'barn':
          return { emoji: '🧒', color: '#ecfdf5', borderColor: '#10b981' };
        default:
          return { emoji: '👤', color: '#f9fafb', borderColor: '#6b7280' };
      }
    };

    const roleDefaults = getRoleDefaults(editForm.role);

    setFamilyMembers(prev =>
      prev.map(member =>
        member.id === editingMember.id
          ? {
              ...member,
              name: editForm.name.trim(),
              role: editForm.role,
              emoji: roleDefaults.emoji,
              color: roleDefaults.color,
              borderColor: roleDefaults.borderColor
            }
          : member
      )
    );

    closeEditMember();
  };

  const inviteFamilyMember = () => {
    if (invitePhone.trim()) {
      if (!validatePhoneNumber(invitePhone.trim())) {
        alert('Vennligst skriv inn et gyldig telefonnummer (f.eks. +47 123 45 678)');
        return;
      }

      // Check if user already exists in the system
      const existingUser = findExistingUser(invitePhone.trim());

      const newInvite = {
        id: Date.now(),
        phone: invitePhone.trim(),
        invitedAt: new Date().toISOString(),
        status: 'pending', // pending, accepted, expired
        existingUser: existingUser
      };

      setPendingInvites(prev => [...prev, newInvite]);
      setInvitePhone('');

      if (existingUser) {
        // Send in-app notification to existing user
        const currentUserName = currentUserRole === 'mor' ? 'Mor' : 'Far';
        sendInAppNotification(existingUser, currentUserName, familyGroupName || 'Min Familie');
        alert(`🔔 Push-melding sendt til ${existingUser.name} (${existingUser.phone})! De vil se invitasjonen i appen.`);
      } else {
        // Send SMS to new user (fallback)
        alert(`📱 SMS-invitasjon sendt til ${newInvite.phone}! Personen må laste ned appen for å bli med.`);
      }
    }
  };

  const cancelInvite = (inviteId) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  const joinFamilyGroup = (inviteCode) => {
    // In a real app, this would validate the invite code and add user to family
    setHasFamily(true);
    alert('Du har blitt lagt til i familiegruppen!');
  };

  // Image upload handler
  const handleImageUpload = (memberId, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFamilyMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId
              ? { ...member, profileImage: e.target.result }
              : member
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile display component
  const ProfileDisplay = ({ member, size = "24px", showName = true }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {member.profileImage ? (
        <img
          src={member.profileImage}
          alt={member.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${member.borderColor}`,
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById(`file-input-${member.id}`)?.click()}
        />
      ) : (
        <span
          style={{
            fontSize: size === "24px" ? "inherit" : "1.5em",
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById(`file-input-${member.id}`)?.click()}
        >
          {member.emoji}
        </span>
      )}
      <input
        id={`file-input-${member.id}`}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleImageUpload(member.id, file);
        }}
      />
      {showName && <span>{member.name}</span>}
    </div>
  );
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Selge huset',
      description: 'Forberede og gjennomføre salg av familiens hus',
      status: 'active',
      progress: 65,
      tasks: 12,
      completedTasks: 8,
      priority: 'high',
      assignedTo: ['Mor', 'Far'],
      dueDate: '2024-12-31',
      category: 'bolig'
    },
    {
      id: 2,
      title: 'Barnehage - Emma',
      description: 'Søknad og oppstart i ny barnehage for Emma',
      status: 'active',
      progress: 90,
      tasks: 5,
      completedTasks: 4,
      priority: 'medium',
      assignedTo: ['Mor'],
      dueDate: '2024-08-15',
      category: 'barn'
    },
    {
      id: 3,
      title: 'Sommerferie planlegging',
      description: 'Planlegge og bestille sommerferie for hele familien',
      status: 'completed',
      progress: 100,
      tasks: 6,
      completedTasks: 6,
      priority: 'low',
      assignedTo: ['Mor', 'Far'],
      dueDate: '2024-06-01',
      category: 'ferie'
    }
  ]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    category: 'annet'
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [standaloneTasks, setStandaloneTasks] = useState([
    {
      id: 1,
      title: 'Handle mat til middag',
      description: 'Kjøpe ingredienser til tacos',
      priority: 'medium',
      assignedTo: 'Mor',
      dueDate: '2024-11-25',
      completed: false,
      isRecurring: false,
      recurrence: null,
      reminders: [
        { id: 1, text: 'Tortillas', completed: false },
        { id: 2, text: 'Kjøttdeig', completed: false },
        { id: 3, text: 'Ost og grønnsaker', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Ringe fastlege',
      description: 'Bestille time for Emma',
      priority: 'high',
      assignedTo: 'Mor',
      dueDate: '2024-11-26',
      completed: false,
      isRecurring: false,
      recurrence: null,
      reminders: [
        { id: 1, text: 'Få henvisning fra skolen', completed: false },
        { id: 2, text: 'Helsekort', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Løse kryss',
      description: 'Ukentlig kryss fra avisen',
      priority: 'low',
      assignedTo: 'Far',
      dueDate: '2024-11-24',
      completed: true,
      isRecurring: true,
      recurrence: 'weekly',
      reminders: [
        { id: 1, text: 'Avis', completed: true },
        { id: 2, text: 'Kaffe', completed: true }
      ]
    }
  ]);
  const [showAddStandaloneTask, setShowAddStandaloneTask] = useState(false);
  const [newStandaloneTask, setNewStandaloneTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    completed: false,
    isRecurring: false,
    recurrence: 'daily',
    reminders: []
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    completed: false,
    reminders: []
  });
  const [projectTasks, setProjectTasks] = useState({
    1: [
      { id: 1, title: 'Ta bilder av huset', description: 'Profesjonelle bilder til salgsannonse', priority: 'high', assignedTo: 'Mor', dueDate: '2024-11-15', completed: true },
      { id: 2, title: 'Finn eiendomsmegler', description: 'Kontakt 3 forskjellige meglere for tilbud', priority: 'high', assignedTo: 'Far', dueDate: '2024-11-20', completed: true },
      { id: 3, title: 'Rydde og reparere', description: 'Fikse små skader og rydde for visning', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-12-01', completed: true },
      { id: 4, title: 'Sett prisantydning', description: 'Diskuter og bestem prisantydning med megler', priority: 'high', assignedTo: 'Far', dueDate: '2024-12-10', completed: true },
      { id: 5, title: 'Markedsføring', description: 'Publiser annonse på finn.no og sosiale medier', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-12-15', completed: true },
      { id: 6, title: 'Arrange visninger', description: 'Koordinere visninger med potensielle kjøpere', priority: 'medium', assignedTo: 'Far', dueDate: '2024-12-20', completed: true },
      { id: 7, title: 'Behandle bud', description: 'Vurdere og forhandle om innkomne bud', priority: 'high', assignedTo: 'Mor', dueDate: '2024-12-22', completed: true },
      { id: 8, title: 'Signere kontrakt', description: 'Gjennomgå og signere salgskontrakt', priority: 'high', assignedTo: 'Far', dueDate: '2024-12-25', completed: true },
      { id: 9, title: 'Forberede overtakelse', description: 'Klargjøre huset for overtakelse', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-12-28', completed: false },
      { id: 10, title: 'Flytte ut', description: 'Pakke og flytte alle eiendeler', priority: 'high', assignedTo: 'Familie', dueDate: '2024-12-30', completed: false },
      { id: 11, title: 'Sluttoppgjør', description: 'Gjennomføre sluttoppgjør med kjøper', priority: 'high', assignedTo: 'Far', dueDate: '2024-12-31', completed: false },
      { id: 12, title: 'Levere nøkler', description: 'Overlevere nøkler til ny eier', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-12-31', completed: false }
    ],
    2: [
      { id: 13, title: 'Søknad barnehageplass', description: 'Fylle ut og sende søknad til kommunen', priority: 'high', assignedTo: 'Mor', dueDate: '2024-08-01', completed: true },
      { id: 14, title: 'Barnehagebesøk', description: 'Besøke aktuelle barnehager med Emma', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-08-10', completed: true },
      { id: 15, title: 'Helseattest', description: 'Få helseattest fra fastlege for Emma', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-08-12', completed: true },
      { id: 16, title: 'Motta tilbud', description: 'Vente på og behandle barnehageplass-tilbud', priority: 'high', assignedTo: 'Mor', dueDate: '2024-08-15', completed: true },
      { id: 17, title: 'Innkjøp utstyr', description: 'Kjøpe sekk, sko og klær til barnehagen', priority: 'low', assignedTo: 'Mor', dueDate: '2024-08-20', completed: false }
    ],
    3: [
      { id: 18, title: 'Velge reisemål', description: 'Bestemme hvor familien skal på ferie', priority: 'medium', assignedTo: 'Familie', dueDate: '2024-03-01', completed: true },
      { id: 19, title: 'Bestille hotell', description: 'Reservere familierom på hotell', priority: 'high', assignedTo: 'Far', dueDate: '2024-03-15', completed: true },
      { id: 20, title: 'Kjøpe flybilletter', description: 'Bestille flybilletter for hele familien', priority: 'high', assignedTo: 'Mor', dueDate: '2024-04-01', completed: true },
      { id: 21, title: 'Pakke kofferter', description: 'Pakke klær og nødvendigheter for ferien', priority: 'medium', assignedTo: 'Familie', dueDate: '2024-06-01', completed: true },
      { id: 22, title: 'Arrangere pass for Emma', description: 'Søke om nytt pass til Emma', priority: 'medium', assignedTo: 'Mor', dueDate: '2024-05-01', completed: true },
      { id: 23, title: 'Planlegge aktiviteter', description: 'Research og planlegge aktiviteter på destinasjonen', priority: 'low', assignedTo: 'Far', dueDate: '2024-05-20', completed: true }
    ]
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({
    projects: true,
    tasks: true,
    calendar: true,
    workSchool: true,
    leisure: true
  });

  // Activity state management
  const [workSchoolActivities, setWorkSchoolActivities] = useState([
    {
      id: 1,
      title: 'Gym på skolen',
      type: 'recurring',
      schedule: 'every_tuesday',
      time: '10:00',
      assignedTo: 'Emma',
      reminders: [
        { id: 1, text: 'Gymutstyr', completed: false },
        { id: 2, text: 'Drikke', completed: false },
        { id: 3, text: 'Ekstra undertøy', completed: false }
      ],
      nextDate: '2024-11-12'
    },
    {
      id: 2,
      title: 'Sykkeldag',
      type: 'single',
      schedule: 'specific_date',
      date: '2024-11-15',
      time: '08:00',
      assignedTo: 'Emma',
      reminders: [
        { id: 1, text: 'Sykkel', completed: false },
        { id: 2, text: 'Hjelm', completed: false },
        { id: 3, text: 'Ekstra niste', completed: false }
      ]
    }
  ]);

  const [leisureActivities, setLeisureActivities] = useState([
    {
      id: 1,
      title: 'Fotball trening',
      type: 'recurring',
      schedule: 'every_tuesday',
      time: '17:00',
      location: 'Karuss',
      assignedTo: 'Emma',
      reminders: [
        { id: 1, text: 'Fotballsko', completed: false },
        { id: 2, text: 'Keeperhansker', completed: false },
        { id: 3, text: 'Drikke', completed: false }
      ],
      nextDate: '2024-11-12'
    },
    {
      id: 2,
      title: 'Kamp mot Idiotiene',
      type: 'single',
      schedule: 'specific_date',
      date: '2024-10-17',
      time: '10:00',
      location: 'Stadion',
      assignedTo: 'Emma',
      reminders: [
        { id: 1, text: 'Drakt', completed: false },
        { id: 2, text: 'Fotballsko', completed: false },
        { id: 3, text: 'Drikke og snacks', completed: false }
      ]
    }
  ]);

  const [showAddWorkSchoolActivity, setShowAddWorkSchoolActivity] = useState(false);
  const [showAddLeisureActivity, setShowAddLeisureActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityType, setActivityType] = useState('work-school');

  // Activity form state
  const [newActivity, setNewActivity] = useState({
    title: '',
    assignedTo: 'Emma',
    type: 'recurring',
    schedule: 'every_tuesday',
    time: '17:00',
    date: '',
    location: '',
    reminders: [],
    reminderTime: '1_hour_before',
    notes: ''
  });
  const [reminderInput, setReminderInput] = useState('');
  const [standaloneTaskReminderInput, setStandaloneTaskReminderInput] = useState('');
  const [projectTaskReminderInput, setProjectTaskReminderInput] = useState('');
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Calendar helper functions
  const formatMonth = (date) => {
    return date.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Helper function to get day of week (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (date) => date.getDay();

  // Helper function to get week number since a reference date
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const daysPassed = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(daysPassed / 7);
  };

  // Check if date is a handover day
  const isHandoverDay = (date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayOfWeek = getDayOfWeek(date);

    // Check if current day matches any of the configured handover days
    return custodyConfig.handoverDays.some(handoverDay => {
      const targetDay = dayNames.indexOf(handoverDay);
      return currentDayOfWeek === targetDay;
    });
  };

  // Get custody owner for a specific date
  const getCustodyOwner = (date) => {
    const { arrangement, startsWith } = custodyConfig;

    switch (arrangement) {
      case 'alternating_weeks': {
        const weekNumber = getWeekNumber(date);
        const isEvenWeek = weekNumber % 2 === 0;
        return (isEvenWeek && startsWith === 'mor') || (!isEvenWeek && startsWith === 'far') ? 'mor' : 'far';
      }

      case 'alternating_weekends': {
        const dayOfWeek = getDayOfWeek(date);
        // Weekend is Friday evening to Sunday evening
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
          const weekNumber = getWeekNumber(date);
          const isEvenWeek = weekNumber % 2 === 0;
          return (isEvenWeek && startsWith === 'mor') || (!isEvenWeek && startsWith === 'far') ? 'mor' : 'far';
        }
        // Weekdays stay with the primary parent (opposite of startsWith for balance)
        return startsWith === 'mor' ? 'far' : 'mor';
      }

      case 'every_third_weekend': {
        const dayOfWeek = getDayOfWeek(date);
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
          const weekNumber = getWeekNumber(date);
          const isThirdWeek = weekNumber % 3 === 0;
          return isThirdWeek ? (startsWith === 'mor' ? 'mor' : 'far') : (startsWith === 'mor' ? 'far' : 'mor');
        }
        return startsWith === 'mor' ? 'far' : 'mor';
      }

      case 'alternating_long_weekends': {
        const dayOfWeek = getDayOfWeek(date);
        // Long weekend is Thursday evening to Monday morning
        if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0 || dayOfWeek === 1) {
          const weekNumber = getWeekNumber(date);
          const isEvenWeek = weekNumber % 2 === 0;
          return (isEvenWeek && startsWith === 'mor') || (!isEvenWeek && startsWith === 'far') ? 'mor' : 'far';
        }
        return startsWith === 'mor' ? 'far' : 'mor';
      }

      default:
        return 'mor';
    }
  };

  const getPersonForDate = (date) => {
    const custodyOwner = getCustodyOwner(date);

    // Return only custody colors - no family member colors
    if (custodyOwner === 'mor') {
      return {
        name: 'Mor',
        emoji: '👩',
        color: '#fce7f3', // Light pink background
        borderColor: '#ec4899' // Pink border
      };
    } else {
      return {
        name: 'Far',
        emoji: '👨',
        color: '#e0f2fe', // Light blue background
        borderColor: '#0284c7' // Blue border
      };
    }
  };

  const addFamilyMember = () => {
    if (newMemberName.trim() && newMemberRole.trim()) {
      const colors = ['#fef3c7', '#dbeafe', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fef2f2'];
      const borderColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#0284c7', '#16a34a', '#dc2626'];

      // Role-based emoji assignment
      const roleEmojis = {
        mor: ['👩', '🤱', '👩‍💼', '👩‍🍳'],
        far: ['👨', '👨‍💼', '👨‍🍳', '👨‍🔧'],
        barn: ['👧', '👦', '🧒', '👶'],
        venn: ['👥', '👤', '🙋‍♀️', '🙋‍♂️']
      };

      const selectedEmojis = roleEmojis[newMemberRole] || ['👤'];

      const newMember = {
        id: Date.now(),
        name: newMemberName.trim(),
        role: newMemberRole,
        emoji: selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        borderColor: borderColors[Math.floor(Math.random() * borderColors.length)],
        profileImage: null
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setNewMemberName('');
      setNewMemberRole('');
      setShowAddMember(false);
    }
  };

  // Packing task functions
  const generatePackingTask = (date) => {
    const children = familyMembers.filter(member => member.role === 'barn');
    const currentOwner = getCustodyOwner(date);
    const nextOwner = currentOwner === 'mor' ? 'far' : 'mor';

    // Calculate duration for packing
    let duration = 7; // Default week
    if (custodyConfig.arrangement === 'alternating_weekends') duration = 3;
    if (custodyConfig.arrangement === 'every_third_weekend') duration = 3;
    if (custodyConfig.arrangement === 'alternating_long_weekends') duration = 5;

    const packingItems = packingTemplate
      .filter(item => item.enabled)
      .map(item => ({
        id: Date.now() + Math.random(),
        item: item.item.replace('{days}', duration.toString()),
        category: item.category,
        checked: false
      }));

    return {
      id: Date.now(),
      title: `Pakking til ${nextOwner} (${custodyConfig.handoverTimes[0] || '15:00'})`,
      dueDate: date.toISOString().split('T')[0],
      type: 'packing',
      children: children.map(child => child.name),
      items: packingItems,
      completed: false,
      fromParent: currentOwner,
      toParent: nextOwner
    };
  };

  const createPackingTaskForHandover = (date) => {
    if (isHandoverDay(date)) {
      const existingTask = packingTasks.find(task =>
        task.dueDate === date.toISOString().split('T')[0] && task.type === 'packing'
      );

      if (!existingTask) {
        const newTask = generatePackingTask(date);
        setPackingTasks(prev => [...prev, newTask]);
        return newTask;
      }
    }
    return null;
  };

  const togglePackingItem = (taskId, itemId) => {
    setPackingTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedItems = task.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        const allChecked = updatedItems.every(item => item.checked);
        return { ...task, items: updatedItems, completed: allChecked };
      }
      return task;
    }));
  };

  const getPackingTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return packingTasks.filter(task => task.dueDate === dateStr);
  };

  // Packing template management functions
  const addPackingItem = () => {
    if (newPackingItem.trim()) {
      const newItem = {
        id: Date.now(),
        item: newPackingItem.trim(),
        category: selectedCategory,
        enabled: true
      };
      setPackingTemplate(prev => [...prev, newItem]);
      setNewPackingItem('');
    }
  };

  const togglePackingTemplateItem = (id) => {
    setPackingTemplate(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const removePackingTemplateItem = (id) => {
    setPackingTemplate(prev => prev.filter(item => item.id !== id));
  };

  const updatePackingTemplateItem = (id, newText) => {
    setPackingTemplate(prev => prev.map(item =>
      item.id === id ? { ...item, item: newText } : item
    ));
  };

  const getActivitiesForPeriod = () => {
    const today = new Date();
    const activities = [];

    if (timePeriod === '1dag') {
      return [
        { time: '08:00', title: 'Emma - Barnehage', person: 'Emma', type: 'barnehage' },
        { time: '17:00', title: 'Oliver - Fotball', person: 'Oliver', type: 'sport' },
        { time: '18:30', title: 'Familie middag', person: 'Familie', type: 'familie' }
      ];
    } else if (timePeriod === '3dager') {
      return [
        { time: 'I dag', title: 'Emma - Barnehage, Familie middag', person: 'Emma/Familie', type: 'mixed' },
        { time: 'I morgen', title: 'Oliver - Fotball, Møte med advokat', person: 'Oliver/Foreldre', type: 'mixed' },
        { time: 'Overmorgen', title: 'Familie tur til badet', person: 'Familie', type: 'familie' }
      ];
    } else { // 1uke
      return [
        { time: 'Man-Tir', title: 'Emma & Oliver - Skole/Barnehage', person: 'Barna', type: 'skole' },
        { time: 'Ons-Tor', title: 'Fotball, Svømming, Familie tid', person: 'Alle', type: 'mixed' },
        { time: 'Fre-Søn', title: 'Helg hos mor/far, Familie aktiviteter', person: 'Familie', type: 'familie' }
      ];
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForMember = (memberName) => {
    // Get standalone tasks for member
    const standaloneTasksForMember = standaloneTasks.filter(task =>
      task.assignedTo === memberName
    );

    // Get project tasks for member
    const projectTasksForMember = [];
    Object.entries(projectTasks).forEach(([projectId, tasks]) => {
      const memberProjectTasks = tasks.filter(task => task.assignedTo === memberName);
      memberProjectTasks.forEach(task => {
        const project = projects.find(p => p.id.toString() === projectId);
        projectTasksForMember.push({
          ...task,
          projectName: project?.title || 'Ukjent prosjekt'
        });
      });
    });

    return {
      standalone: standaloneTasksForMember,
      project: projectTasksForMember,
      total: standaloneTasksForMember.length + projectTasksForMember.length
    };
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to calculate tasks due today
  const getTodaysTasks = () => {
    const today = getTodayDate();

    // Get standalone tasks due today
    const standaloneTasksToday = standaloneTasks.filter(task =>
      task.dueDate === today && !task.completed
    );

    // Get project tasks due today
    const projectTasksToday = [];
    Object.entries(projectTasks).forEach(([projectId, tasks]) => {
      const todayProjectTasks = tasks.filter(task =>
        task.dueDate === today && !task.completed
      );
      projectTasksToday.push(...todayProjectTasks);
    });

    return standaloneTasksToday.length + projectTasksToday.length;
  };

  // Helper function to get tasks for current user (assuming "Mor" is logged in)
  const getCurrentUserTasks = () => {
    const currentUser = 'Mor'; // This would come from authentication in a real app
    return getTasksForMember(currentUser);
  };

  // Helper function to check if an activity occurs on a specific date
  const isActivityOnDate = (activity, date) => {
    if (activity.type === 'single') {
      return activity.schedule === date.toISOString().split('T')[0];
    }

    if (activity.type === 'recurring') {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const scheduleMap = {
        'every_monday': 1,
        'every_tuesday': 2,
        'every_wednesday': 3,
        'every_thursday': 4,
        'every_friday': 5,
        'every_saturday': 6,
        'every_sunday': 0
      };
      return scheduleMap[activity.schedule] === dayOfWeek;
    }

    return false;
  };

  // Helper function to get activities for a specific date
  const getActivitiesForDate = (date) => {
    const allActivities = [...workSchoolActivities, ...leisureActivities];
    return allActivities.filter(activity => isActivityOnDate(activity, date));
  };

  // Helper function to toggle person filter in a section
  const togglePersonFilter = (section, person) => {
    setSectionFilters(prev => {
      const currentFilters = prev[section];

      if (person === 'alle') {
        // If "alle" is clicked, set to only "alle"
        return { ...prev, [section]: ['alle'] };
      }

      // If a specific person is clicked
      let newFilters;
      if (currentFilters.includes('alle')) {
        // If "alle" was selected, replace with the specific person
        newFilters = [person];
      } else if (currentFilters.includes(person)) {
        // If person is already selected, remove them
        newFilters = currentFilters.filter(p => p !== person);
        // If no one is selected, default to "alle"
        if (newFilters.length === 0) {
          newFilters = ['alle'];
        }
      } else {
        // Add the person to the selection
        newFilters = [...currentFilters, person];
      }

      return { ...prev, [section]: newFilters };
    });
  };

  // Helper function to check if a person is selected in a section
  const isPersonSelectedInSection = (section, person) => {
    return sectionFilters[section].includes(person);
  };

  // Helper function to filter items by selected persons in a section
  const filterByPersons = (items, section, getAssignedTo) => {
    const selectedPersons = sectionFilters[section];
    if (selectedPersons.includes('alle')) {
      return items;
    }
    return items.filter(item => {
      const assignedTo = getAssignedTo(item);
      return selectedPersons.some(person =>
        assignedTo?.toLowerCase() === person.toLowerCase()
      );
    });
  };

  // Component to render person filter buttons for a section
  const PersonFilterButtons = ({ section }) => (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${isPersonSelectedInSection(section, 'alle') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => togglePersonFilter(section, 'alle')}
        >
          👨‍👩‍👧‍👦 Alle
        </button>
        {familyMembers.map(member => (
          <button
            key={member.id}
            className={`btn ${isPersonSelectedInSection(section, member.name.toLowerCase()) ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => togglePersonFilter(section, member.name.toLowerCase())}
          >
            <ProfileDisplay member={member} size="16px" showName={true} />
          </button>
        ))}
      </div>
    </div>
  );

  // Activity helper functions
  const addReminder = () => {
    if (reminderInput.trim()) {
      setNewActivity(prev => ({
        ...prev,
        reminders: [...prev.reminders, {
          id: Date.now(),
          text: reminderInput.trim(),
          completed: false
        }]
      }));
      setReminderInput('');
    }
  };

  const removeReminder = (reminderId) => {
    setNewActivity(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId)
    }));
  };

  // Standalone task reminder helper functions
  const addStandaloneTaskReminder = () => {
    if (standaloneTaskReminderInput.trim()) {
      setNewStandaloneTask(prev => ({
        ...prev,
        reminders: [...prev.reminders, {
          id: Date.now(),
          text: standaloneTaskReminderInput.trim(),
          completed: false
        }]
      }));
      setStandaloneTaskReminderInput('');
    }
  };

  const removeStandaloneTaskReminder = (reminderId) => {
    setNewStandaloneTask(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId)
    }));
  };

  // Project task reminder helper functions
  const addProjectTaskReminder = () => {
    if (projectTaskReminderInput.trim()) {
      setNewTask(prev => ({
        ...prev,
        reminders: [...prev.reminders, {
          id: Date.now(),
          text: projectTaskReminderInput.trim(),
          completed: false
        }]
      }));
      setProjectTaskReminderInput('');
    }
  };

  const removeProjectTaskReminder = (reminderId) => {
    setNewTask(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId)
    }));
  };

  // Task detail helper functions
  const openTaskDetail = (task, taskType = 'standalone') => {
    setSelectedTask({ ...task, taskType });
    setShowTaskDetail(true);
  };

  const handleSubmitActivity = () => {
    if (!newActivity.title.trim()) return;

    if (newActivity.type === 'recurring') {
      const activity = {
        id: Date.now(),
        title: newActivity.title,
        assignedTo: newActivity.assignedTo,
        type: newActivity.type,
        schedule: newActivity.schedule,
        time: newActivity.time,
        ...(activityType === 'leisure' && newActivity.location && { location: newActivity.location }),
        reminders: newActivity.reminders,
        nextDate: calculateNextDate(newActivity.schedule)
      };

      if (activityType === 'work-school') {
        setWorkSchoolActivities(prev => [...prev, activity]);
      } else {
        setLeisureActivities(prev => [...prev, activity]);
      }
    } else {
      const activity = {
        id: Date.now(),
        title: newActivity.title,
        assignedTo: newActivity.assignedTo,
        type: newActivity.type,
        schedule: 'specific_date',
        time: newActivity.time,
        date: newActivity.date,
        ...(activityType === 'leisure' && newActivity.location && { location: newActivity.location }),
        reminders: newActivity.reminders
      };

      if (activityType === 'work-school') {
        setWorkSchoolActivities(prev => [...prev, activity]);
      } else {
        setLeisureActivities(prev => [...prev, activity]);
      }
    }

    // Reset form
    setNewActivity({
      title: '',
      assignedTo: 'Emma',
      type: 'recurring',
      schedule: 'every_tuesday',
      time: '17:00',
      date: '',
      location: '',
      reminders: [],
      reminderTime: '1_hour_before',
      notes: ''
    });
    setReminderInput('');
    setShowAddWorkSchoolActivity(false);
    setShowAddLeisureActivity(false);
  };

  const calculateNextDate = (schedule) => {
    const today = new Date();
    const dayMap = {
      'every_monday': 1,
      'every_tuesday': 2,
      'every_wednesday': 3,
      'every_thursday': 4,
      'every_friday': 5,
      'every_saturday': 6,
      'every_sunday': 0
    };

    const targetDay = dayMap[schedule];
    if (targetDay === undefined) return '';

    const daysUntilNext = (targetDay - today.getDay() + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);

    return nextDate.toISOString().split('T')[0];
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Mobile Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1rem' }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Familie TODO</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Position Toggle Button */}
            <button
              onClick={() => setNotificationButtonPosition(prev => prev === 'right' ? 'left' : 'right')}
              style={{
                padding: '0.375rem',
                border: '1px solid #d1d5db',
                background: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '2.5rem',
                height: '2.5rem'
              }}
              title={`Flytt knapper til ${notificationButtonPosition === 'right' ? 'venstre' : 'høyre'}`}
            >
              {notificationButtonPosition === 'right' ? '⬅️' : '➡️'}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  padding: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem'
                }}
              >
                🔔
              </button>
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                padding: '0.5rem',
                fontSize: '1.2rem',
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem'
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: '4.5rem',
          ...(notificationButtonPosition === 'right' ? { right: '0.5rem' } : { left: '0.5rem' }),
          width: '320px',
          maxWidth: 'calc(100vw - 1rem)',
          background: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          maxHeight: '70vh',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
              Varsler
            </h3>
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '0.5rem' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ margin: 0 }}>Ingen nye varsler</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '0.75rem',
                    margin: '0.25rem 0',
                    borderRadius: '0.375rem',
                    background: notification.read ? '#f9fafb' : '#eff6ff',
                    border: notification.read ? '1px solid #e5e7eb' : '1px solid #bfdbfe'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '1.5rem' }}>👨‍👩‍👧‍👦</div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        fontWeight: notification.read ? 'normal' : '600'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem'
                      }}>
                        {new Date(notification.createdAt).toLocaleString('no-NO')}
                      </div>

                      {!notification.action && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleNotificationAction(notification.id, 'accept')}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✓ Godta
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notification.id, 'decline')}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✕ Avslå
                          </button>
                        </div>
                      )}

                      {notification.action && (
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: notification.action === 'accept' ? '#10b981' : '#ef4444'
                        }}>
                          {notification.action === 'accept' ? '✓ Godtatt' : '✕ Avslått'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Family Member Modal */}
      {showEditMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.25)',
            margin: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: 0
              }}>
                Rediger familiemedlem
              </h3>
              <button
                onClick={closeEditMember}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveEditMember(); }}>
              {/* Name Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Navn
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Skriv inn navn"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Rolle
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                  required
                >
                  <option value="">Velg rolle</option>
                  <option value="mor">👩 Mor</option>
                  <option value="far">👨 Far</option>
                  <option value="barn">🧒 Barn</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={closeEditMember}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Lagre endringer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside data-mobile-menu="true" style={{
          position: 'fixed',
          top: 0,
          left: showMobileMenu ? 0 : '-256px',
          width: '256px',
          height: '100vh',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '1rem',
          transition: 'left 0.3s ease',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Familie TODO</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Organiser familielivet</p>
          </div>

          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { id: 'overview', label: '📊 Oversikt' },
                { id: 'tasks', label: '✅ Oppgaver' },
                { id: 'projects', label: '📁 Prosjekter' },
                { id: 'calendar', label: '📅 Kalender' },
                { id: 'work-school', label: '🏫 Skole/Arbeid' },
                { id: 'leisure', label: '⚽ Fritidsaktiviteter' },
                { id: 'family', label: '👨‍👩‍👧‍👦 Familie' },
                { id: 'settings', label: '⚙️ Innstillinger' }
              ].map(item => (
                <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: activeTab === item.id ? '#3b82f6' : 'transparent',
                      color: activeTab === item.id ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile menu */}
        {showMobileMenu && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: '0.75rem', paddingBottom: '5rem' }}>
          {activeTab === 'overview' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📊 Oversikt
              </h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
                <div
                  className="card"
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => {
                    setActiveTab('projects');
                    setShowUserTasks(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Aktive Prosjekter
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div
                  className="card"
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowUserTasks(false);
                    setSectionFilters(prev => ({ ...prev, tasks: ['alle'] }));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Oppgaver i dag
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {getTodaysTasks()}
                  </p>
                </div>
                <div
                  className="card"
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowUserTasks(true);
                    setSectionFilters(prev => ({ ...prev, tasks: ['mor'] }));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Mine oppgaver
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                    {getCurrentUserTasks().total}
                  </p>
                </div>
              </div>

              {/* Time Period Filters */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {[
                    { id: '1dag', label: '1 dag' },
                    { id: '3dager', label: '3 dager' },
                    { id: '1uke', label: '1 uke' }
                  ].map(period => (
                    <button
                      key={period.id}
                      className={`btn ${timePeriod === period.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => setTimePeriod(period.id)}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Widget */}
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  ☀️ Været
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.125rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.125rem' }}>I dag</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>☀️</div>
                    <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>18°</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.125rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.125rem' }}>I morgen</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>⛅</div>
                    <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>16°</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.125rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.125rem' }}>Overmorgen</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>🌧️</div>
                    <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>14°</div>
                  </div>
                </div>

                {/* Activities based on time period */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    📅 Aktiviteter ({timePeriod === '1dag' ? '1 dag' : timePeriod === '3dager' ? '3 dager' : '1 uke'})
                  </h3>
                  <div style={{ display: 'grid', gap: '0.25rem' }}>
                    {getActivitiesForPeriod().map((activity, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.375rem 0.5rem',
                          background: 'white',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ fontWeight: '500', color: '#374151' }}>
                          {activity.time}
                        </div>
                        <div style={{
                          flex: 1,
                          paddingLeft: '0.5rem',
                          color: '#6b7280',
                          fontSize: '0.7rem',
                          textAlign: 'right'
                        }}>
                          {activity.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Calendar Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  className="section-header"
                  onClick={() => toggleSection('calendar')}
                  style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    📅 Kalender
                  </h2>
                  <button
                    className={`section-toggle ${!collapsedSections.calendar ? 'expanded' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transform: !collapsedSections.calendar ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    ▶
                  </button>
                </div>
                <div
                  className={`section-content ${collapsedSections.calendar ? 'collapsed' : ''}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: collapsedSections.calendar ? '0' : '1000px',
                    opacity: collapsedSections.calendar ? 0 : 1,
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >

                <div className="card" style={{ padding: '0.75rem' }}>
                  {/* Calendar Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#6b7280'
                      }}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    >
                      ‹
                    </button>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                      {formatMonth(currentDate)}
                    </h3>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#6b7280'
                      }}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    >
                      ›
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    marginBottom: '0.5rem'
                  }}>
                    {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map(day => (
                      <div key={day} style={{
                        fontWeight: '600',
                        color: '#6b7280',
                        padding: '0.5rem 0',
                        textAlign: 'center',
                        fontSize: '0.75rem'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px'
                  }}>
                    {getDaysInMonth(currentDate).map((date, index) => {
                      if (!date) {
                        return <div key={index} style={{ aspectRatio: '1', minHeight: '32px' }} />;
                      }

                      const personForDate = getPersonForDate(date);
                      const today = isToday(date);
                      const activitiesForDate = getActivitiesForDate(date);
                      const hasActivities = activitiesForDate.length > 0;

                      return (
                        <div
                          key={index}
                          className={`calendar-day ${today ? 'today' : ''}`}
                          style={{
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            position: 'relative',
                            minHeight: '32px',
                            padding: '2px',
                            background: today ? '#3b82f6' : personForDate.color,
                            color: today ? 'white' : '#374151',
                            border: `1px solid ${today ? '#2563eb' : personForDate.borderColor}`
                          }}
                          onClick={() => {
                            const dateFormatted = date.toLocaleDateString('no-NO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                            const custodyInfo = `Aktiviteter for ${personForDate.name}`;
                            const activities = activitiesForDate.map(activity => ({
                              name: activity.title,
                              time: activity.time,
                              type: activity.type === 'recurring' ? 'recurring' : 'single',
                              assignedTo: activity.assignedTo,
                              location: (activity as any).location || '',
                              reminders: activity.reminders
                            }));

                            setSelectedCalendarDay({
                              date: dateFormatted,
                              custodyInfo,
                              activities,
                              hasActivities,
                              person: personForDate
                            });
                          }}
                        >
                          <span style={{ fontWeight: today ? '600' : '500' }}>
                            {date.getDate()}
                          </span>
                          {hasActivities && (
                            <div style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              marginTop: '2px',
                              background: today ? 'rgba(255,255,255,0.8)' : personForDate.borderColor
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    {familyMembers.map(member => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          background: member.color,
                          borderRadius: '2px',
                          border: `1px solid ${member.borderColor}`
                        }} />
                        <ProfileDisplay member={member} size="20px" showName={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Calendar Day Expanded Content */}
              {selectedCalendarDay && (
                <div style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        📅 {selectedCalendarDay.date}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        👥 {selectedCalendarDay.custodyInfo}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCalendarDay(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {selectedCalendarDay.hasActivities ? (
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Aktiviteter:</h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {selectedCalendarDay.activities.map((activity, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.75rem',
                              background: '#f8fafc',
                              borderRadius: '0.5rem',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                            onClick={() => alert(`Klikket på aktivitet: ${activity.name} (${activity.time})`)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '500' }}>{activity.name}</span>
                              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{activity.time}</span>
                            </div>
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                background: activity.type === 'barnehage' ? '#fef3c7' : activity.type === 'sport' ? '#dbeafe' : '#f3e8ff',
                                color: activity.type === 'barnehage' ? '#92400e' : activity.type === 'sport' ? '#1e40af' : '#6b21a8'
                              }}>
                                {activity.type === 'barnehage' ? '🏫 Barnehage' : activity.type === 'sport' ? '⚽ Sport' : '👨‍👩‍👧‍👦 Familie'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                      <p>Ingen spesielle aktiviteter denne dagen.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>💡 Klikk på familiefiltrene for å se spesifikke aktiviteter!</p>
                    </div>
                  )}
                </div>
              )}
              </div>

              {/* Tasks Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  className="section-header"
                  onClick={() => toggleSection('tasks')}
                  style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    ✅ Oppgaver
                  </h2>
                  <button
                    className={`section-toggle ${!collapsedSections.tasks ? 'expanded' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transform: !collapsedSections.tasks ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    ▶
                  </button>
                </div>
                <div
                  className={`section-content ${collapsedSections.tasks ? 'collapsed' : ''}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: collapsedSections.tasks ? '0' : '1000px',
                    opacity: collapsedSections.tasks ? 0 : 1,
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >
                  <PersonFilterButtons section="tasks" />
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {filterByPersons(standaloneTasks, 'tasks', (task) => task.assignedTo).sort((a, b) => a.completed - b.completed).slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="card"
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: 'translateY(0px)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          opacity: task.completed ? 0.7 : 1,
                          background: task.completed ? '#f8fafc' : 'white'
                        }}
                        onClick={() => openTaskDetail(task, 'standalone')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: task.completed ? '#16a34a' :
                              task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#16a34a'
                          }}></span>
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                            flex: 1,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#6b7280' : '#111827'
                          }}>
                            {task.completed ? '✅' : '📋'} {task.title}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{task.assignedTo}</span>
                        </div>
                        {task.description && (
                          <p style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            margin: '0.25rem 0 0 1rem',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.description}
                          </p>
                        )}
                        {task.reminders && task.reminders.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 1rem' }}>
                            📝 {task.reminders.length} huskeliste{task.reminders.length !== 1 ? 'r' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                    {standaloneTasks.length > 3 && (
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                          +{standaloneTasks.length - 3} flere oppgaver...
                        </p>
                      </div>
                    )}
                    {standaloneTasks.length === 0 && (
                      <div className="card" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                        <p style={{ margin: 0 }}>Ingen oppgaver ennå</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div>
                <div
                  className="section-header"
                  onClick={() => toggleSection('projects')}
                  style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    📁 Prosjekter
                  </h2>
                  <button
                    className={`section-toggle ${!collapsedSections.projects ? 'expanded' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transform: !collapsedSections.projects ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    ▶
                  </button>
                </div>
                <div
                  className={`section-content ${collapsedSections.projects ? 'collapsed' : ''}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: collapsedSections.projects ? '0' : '1000px',
                    opacity: collapsedSections.projects ? 0 : 1,
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {projects.filter(p => p.status === 'active').map(project => (
                      <div
                        key={project.id}
                        className="card"
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: 'translateY(0px)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveTab('projects');
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{project.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {project.completedTasks}/{project.tasks} oppgaver - {project.progress}% fullført
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Work/School Activities Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  className="section-header"
                  onClick={() => toggleSection('workSchool')}
                  style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    🏫 Skole/Arbeid aktiviteter
                  </h2>
                  <button
                    className={`section-toggle ${!collapsedSections.workSchool ? 'expanded' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transform: !collapsedSections.workSchool ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    ▶
                  </button>
                </div>
                <div
                  className={`section-content ${collapsedSections.workSchool ? 'collapsed' : ''}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: collapsedSections.workSchool ? '0' : '1000px',
                    opacity: collapsedSections.workSchool ? 0 : 1,
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >
                  <PersonFilterButtons section="workSchool" />
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {filterByPersons(workSchoolActivities, 'workSchool', (activity) => activity.assignedTo).map(activity => (
                      <div
                        key={activity.id}
                        className="card"
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: 'translateY(0px)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => setActiveTab('work-school')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                            🏫 {activity.title}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: activity.type === 'recurring' ? '#dbeafe' : '#fef3c7',
                            color: activity.type === 'recurring' ? '#1e40af' : '#92400e'
                          }}>
                            {activity.type === 'recurring' ? 'Ukentlig' : 'Enkelt'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          For: {activity.assignedTo} • {activity.schedule === 'every_monday' ? 'Hver mandag' :
                                activity.schedule === 'every_tuesday' ? 'Hver tirsdag' :
                                activity.schedule === 'every_wednesday' ? 'Hver onsdag' :
                                activity.schedule === 'every_thursday' ? 'Hver torsdag' :
                                activity.schedule === 'every_friday' ? 'Hver fredag' :
                                activity.schedule === 'every_saturday' ? 'Hver lørdag' :
                                activity.schedule === 'every_sunday' ? 'Hver søndag' :
                                activity.date} • {activity.time}
                        </div>
                        {activity.location && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            📍 {activity.location}
                          </div>
                        )}
                        {activity.reminders.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📝 {activity.reminders.length} huskeliste{activity.reminders.length !== 1 ? 'r' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                    {filterByPersons(workSchoolActivities, 'workSchool', (activity) => activity.assignedTo).length === 0 && (
                      <div className="card" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                        <p style={{ margin: 0 }}>Ingen skole/arbeid aktiviteter ennå</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leisure Activities Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  className="section-header"
                  onClick={() => toggleSection('leisure')}
                  style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    ⚽ Fritidsaktiviteter
                  </h2>
                  <button
                    className={`section-toggle ${!collapsedSections.leisure ? 'expanded' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transform: !collapsedSections.leisure ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    ▶
                  </button>
                </div>
                <div
                  className={`section-content ${collapsedSections.leisure ? 'collapsed' : ''}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: collapsedSections.leisure ? '0' : '1000px',
                    opacity: collapsedSections.leisure ? 0 : 1,
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >
                  <PersonFilterButtons section="leisure" />
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {filterByPersons(leisureActivities, 'leisure', (activity) => activity.assignedTo).map(activity => (
                      <div
                        key={activity.id}
                        className="card"
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: 'translateY(0px)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => setActiveTab('leisure')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                            ⚽ {activity.title}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: activity.type === 'recurring' ? '#dbeafe' : '#fef3c7',
                            color: activity.type === 'recurring' ? '#1e40af' : '#92400e'
                          }}>
                            {activity.type === 'recurring' ? 'Ukentlig' : 'Enkelt'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          For: {activity.assignedTo} • {activity.schedule === 'every_monday' ? 'Hver mandag' :
                                activity.schedule === 'every_tuesday' ? 'Hver tirsdag' :
                                activity.schedule === 'every_wednesday' ? 'Hver onsdag' :
                                activity.schedule === 'every_thursday' ? 'Hver torsdag' :
                                activity.schedule === 'every_friday' ? 'Hver fredag' :
                                activity.schedule === 'every_saturday' ? 'Hver lørdag' :
                                activity.schedule === 'every_sunday' ? 'Hver søndag' :
                                activity.date} • {activity.time}
                        </div>
                        {activity.location && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            📍 {activity.location}
                          </div>
                        )}
                        {activity.reminders.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📝 {activity.reminders.length} huskeliste{activity.reminders.length !== 1 ? 'r' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                    {filterByPersons(leisureActivities, 'leisure', (activity) => activity.assignedTo).length === 0 && (
                      <div className="card" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                        <p style={{ margin: 0 }}>Ingen fritidsaktiviteter ennå</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setActiveTab('overview')}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  ✅ Oppgaver
                </h1>
              </div>

              {/* Task Stats */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Aktive oppgaver
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {standaloneTasks.filter(t => !t.completed).length}
                  </p>
                </div>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Fullførte oppgaver
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                    {standaloneTasks.filter(t => t.completed).length}
                  </p>
                </div>
              </div>

              {/* Add Task Button */}
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Alle oppgaver ({standaloneTasks.length})
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => setShowAddStandaloneTask(true)}
                >
                  + Ny oppgave
                </button>
              </div>

              {/* Task List */}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {standaloneTasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map(task => (
                  <div
                    key={task.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      opacity: task.completed ? 0.7 : 1,
                      background: task.completed ? '#f8fafc' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => openTaskDetail(task, 'standalone')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          setStandaloneTasks(standaloneTasks.map(t =>
                            t.id === task.id ? { ...t, completed: !t.completed } : t
                          ));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '1.2rem',
                          height: '1.2rem',
                          marginTop: '0.1rem',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                            color: task.priority === 'high' ? '#b91c1c' : task.priority === 'medium' ? '#b45309' : '#15803d',
                            border: `2px solid ${task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'}`,
                            fontWeight: '600'
                          }}>
                            {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                          {task.isRecurring && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #7dd3fc'
                            }}>
                              🔄 {task.recurrence === 'daily' ? 'Daglig' : task.recurrence === 'weekly' ? 'Ukentlig' : 'Månedlig'}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                          <span>📅 {task.dueDate}</span>
                          <span>👤 {task.assignedTo}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.8rem',
                          background: '#fef2f2',
                          borderColor: '#fecaca',
                          color: '#dc2626'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Er du sikker på at du vil slette oppgaven "${task.title}"?`)) {
                            setStandaloneTasks(standaloneTasks.filter(t => t.id !== task.id));
                          }
                        }}
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {standaloneTasks.length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  <p>Ingen oppgaver ennå. Klikk på "Ny oppgave" for å legge til den første oppgaven.</p>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Hurtighandlinger
                </h2>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => setActiveTab('projects')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📁</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Se prosjekter
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Vis oppgaver knyttet til prosjekter
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => setActiveTab('overview')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📊</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Se oversikt
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Gå tilbake til hovedoversikten
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Add Standalone Task Modal */}
              {showAddStandaloneTask && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1010,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                      Legg til ny oppgave
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tittel:</label>
                      <input
                        className="form-input"
                        type="text"
                        value={newStandaloneTask.title}
                        onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, title: e.target.value })}
                        placeholder="Oppgavetittel..."
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Beskrivelse:</label>
                      <textarea
                        className="form-input"
                        value={newStandaloneTask.description}
                        onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, description: e.target.value })}
                        placeholder="Beskrivelse av oppgaven..."
                        rows={3}
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Prioritet:</label>
                      <select
                        className="form-input"
                        value={newStandaloneTask.priority}
                        onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, priority: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <option value="low">Lav</option>
                        <option value="medium">Medium</option>
                        <option value="high">Høy</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tildelt til:</label>
                      <select
                        className="form-input"
                        value={newStandaloneTask.assignedTo}
                        onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, assignedTo: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <option value="">Velg person...</option>
                        {familyMembers.map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Forfallsdato:</label>
                      <input
                        className="form-input"
                        type="date"
                        value={newStandaloneTask.dueDate}
                        onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, dueDate: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStandaloneTask.isRecurring}
                          onChange={(e) => setNewStandaloneTask({
                            ...newStandaloneTask,
                            isRecurring: e.target.checked,
                            recurrence: e.target.checked ? 'daily' : null
                          })}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Gjentagende oppgave</span>
                      </label>
                    </div>

                    {newStandaloneTask.isRecurring && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Hvor ofte:</label>
                        <select
                          className="form-input"
                          value={newStandaloneTask.recurrence || 'daily'}
                          onChange={(e) => setNewStandaloneTask({ ...newStandaloneTask, recurrence: e.target.value })}
                          style={{ marginBottom: '0.5rem' }}
                        >
                          <option value="daily">Daglig</option>
                          <option value="weekly">Ukentlig</option>
                          <option value="monthly">Månedlig</option>
                        </select>
                      </div>
                    )}

                    {/* Huskeliste */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Huskeliste</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={standaloneTaskReminderInput}
                          onChange={(e) => setStandaloneTaskReminderInput(e.target.value)}
                          placeholder="Legg til huskeliste element"
                          style={{ flex: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addStandaloneTaskReminder();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={addStandaloneTaskReminder}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          +
                        </button>
                      </div>

                      {newStandaloneTask.reminders.length > 0 && (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem' }}>
                          {newStandaloneTask.reminders.map(reminder => (
                            <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                              <span style={{ fontSize: '0.875rem' }}>{reminder.text}</span>
                              <button
                                type="button"
                                onClick={() => removeStandaloneTaskReminder(reminder.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowAddStandaloneTask(false);
                          setNewStandaloneTask({
                            title: '',
                            description: '',
                            priority: 'medium',
                            assignedTo: '',
                            dueDate: '',
                            completed: false,
                            isRecurring: false,
                            recurrence: null,
                            reminders: []
                          });
                          setStandaloneTaskReminderInput('');
                        }}
                      >
                        Avbryt
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (!newStandaloneTask.title.trim()) return;

                          const task = {
                            id: Date.now() + Math.random(),
                            ...newStandaloneTask,
                            completed: false
                          };

                          setStandaloneTasks(prev => [...prev, task]);

                          // Reset form and close modal
                          setShowAddStandaloneTask(false);
                          setNewStandaloneTask({
                            title: '',
                            description: '',
                            priority: 'medium',
                            assignedTo: '',
                            dueDate: '',
                            completed: false,
                            isRecurring: false,
                            recurrence: null,
                            reminders: []
                          });
                          setStandaloneTaskReminderInput('');
                        }}
                        disabled={!newStandaloneTask.title.trim()}
                      >
                        Legg til oppgave
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && !selectedProject && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setActiveTab('overview')}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  📁 Prosjekter
                </h1>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Aktive prosjekter
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Fullførte prosjekter
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>

              {/* Add Project Button */}
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Alle prosjekter ({projects.length})
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => setShowAddProject(true)}
                >
                  + Nytt prosjekt
                </button>
              </div>

              {/* Project List */}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveTab('projects');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                            {project.title}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: project.priority === 'high' ? '#fef2f2' : project.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                            color: project.priority === 'high' ? '#b91c1c' : project.priority === 'medium' ? '#b45309' : '#15803d',
                            border: `2px solid ${project.priority === 'high' ? '#f87171' : project.priority === 'medium' ? '#f59e0b' : '#22c55e'}`,
                            fontWeight: '600'
                          }}>
                            {project.priority === 'high' ? 'Høy' : project.priority === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                          {project.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                          <span>📅 {project.dueDate}</span>
                          <span>👥 {project.assignedTo.join(', ')}</span>
                          <span>📂 {project.category}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8rem',
                            background: project.status === 'completed' ? '#f0fdf4' : '#fef2f2',
                            borderColor: project.status === 'completed' ? '#bbf7d0' : '#fecaca',
                            color: project.status === 'completed' ? '#16a34a' : '#dc2626'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatus = project.status === 'active' ? 'completed' : 'active';
                            const newProgress = newStatus === 'completed' ? 100 : project.progress;
                            const newCompletedTasks = newStatus === 'completed' ? project.tasks : project.completedTasks;

                            setProjects(projects.map(p =>
                              p.id === project.id
                                ? { ...p, status: newStatus, progress: newProgress, completedTasks: newCompletedTasks }
                                : p
                            ));
                          }}
                        >
                          {project.status === 'completed' ? '🔄 Reaktiver' : '✅ Fullfør'}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Fremdrift</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {project.completedTasks}/{project.tasks} oppgaver ({project.progress}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${project.progress}%`,
                          height: '100%',
                          background: project.status === 'completed' ? '#16a34a' : '#3b82f6',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Hurtighandlinger
                </h2>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => alert('Prosjektmaler kommer snart!')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📋</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Bruk prosjektmal
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Start med forhåndsdefinerte maler for vanlige prosjekter
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => setActiveTab('overview')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📊</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Se prosjektoversikt
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Gå tilbake til hovedoversikten
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Detail View */}
          {activeTab === 'projects' && selectedProject && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setSelectedProject(null)}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {selectedProject.title}
                </h1>
              </div>

              {/* Project Info */}
              <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                  {selectedProject.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Status: </span>
                    <span style={{
                      color: selectedProject.status === 'completed' ? '#16a34a' : '#3b82f6',
                      fontWeight: '500'
                    }}>
                      {selectedProject.status === 'completed' ? 'Fullført' : 'Aktiv'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Prioritet: </span>
                    <span style={{
                      background: selectedProject.priority === 'high' ? '#fef2f2' : selectedProject.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                      color: selectedProject.priority === 'high' ? '#b91c1c' : selectedProject.priority === 'medium' ? '#b45309' : '#15803d',
                      border: `2px solid ${selectedProject.priority === 'high' ? '#f87171' : selectedProject.priority === 'medium' ? '#f59e0b' : '#22c55e'}`,
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem'
                    }}>
                      {selectedProject.priority === 'high' ? 'Høy' : selectedProject.priority === 'medium' ? 'Medium' : 'Lav'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Frist: </span>
                    <span style={{ fontWeight: '500' }}>{selectedProject.dueDate}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Ansvarlige: </span>
                    <span style={{ fontWeight: '500' }}>{selectedProject.assignedTo.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Fullførte oppgaver
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                    {projectTasks[selectedProject.id]?.filter(t => t.completed).length || 0}
                  </p>
                </div>
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Totale oppgaver
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {projectTasks[selectedProject.id]?.length || 0}
                  </p>
                </div>
              </div>

              {/* Add Task Button */}
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Oppgaver ({projectTasks[selectedProject.id]?.length || 0})
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => setShowAddTask(true)}
                >
                  + Ny oppgave
                </button>
              </div>

              {/* Task List */}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {(projectTasks[selectedProject.id] || []).sort((a, b) => a.completed - b.completed).map(task => (
                  <div key={task.id} className="card" style={{
                    padding: '1rem',
                    opacity: task.completed ? 0.7 : 1,
                    background: task.completed ? '#f8fafc' : 'white',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          const updatedTasks = projectTasks[selectedProject.id].map(t =>
                            t.id === task.id ? { ...t, completed: !t.completed } : t
                          );
                          setProjectTasks({
                            ...projectTasks,
                            [selectedProject.id]: updatedTasks
                          });

                          // Update project progress
                          const completedCount = updatedTasks.filter(t => t.completed).length;
                          const totalCount = updatedTasks.length;
                          const newProgress = Math.round((completedCount / totalCount) * 100);

                          setProjects(projects.map(p =>
                            p.id === selectedProject.id
                              ? { ...p, completedTasks: completedCount, progress: newProgress }
                              : p
                          ));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '1.2rem',
                          height: '1.2rem',
                          marginTop: '0.1rem',
                          cursor: 'pointer'
                        }}
                      />
                      <div
                        style={{ flex: 1 }}
                        onClick={() => openTaskDetail(task, 'project')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                            color: task.priority === 'high' ? '#b91c1c' : task.priority === 'medium' ? '#b45309' : '#15803d',
                            border: `2px solid ${task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'}`,
                            fontWeight: '600'
                          }}>
                            {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                        </div>
                        {task.description && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                          <span>📅 {task.dueDate}</span>
                          <span>👤 {task.assignedTo}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.8rem',
                          background: '#fef2f2',
                          borderColor: '#fecaca',
                          color: '#dc2626'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Er du sikker på at du vil slette oppgaven "${task.title}"?`)) {
                            const updatedTasks = projectTasks[selectedProject.id].filter(t => t.id !== task.id);
                            setProjectTasks({
                              ...projectTasks,
                              [selectedProject.id]: updatedTasks
                            });

                            // Update project progress
                            const completedCount = updatedTasks.filter(t => t.completed).length;
                            const totalCount = updatedTasks.length;
                            const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            setProjects(projects.map(p =>
                              p.id === selectedProject.id
                                ? { ...p, tasks: totalCount, completedTasks: completedCount, progress: newProgress }
                                : p
                            ));
                          }
                        }}
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(projectTasks[selectedProject.id] || []).length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  <p>Ingen oppgaver ennå. Klikk på "Ny oppgave" for å legge til den første oppgaven.</p>
                </div>
              )}
              {/* Add Task Modal */}
              {showAddTask && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1010,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                      Legg til oppgave til {selectedProject.title}
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tittel:</label>
                      <input
                        className="form-input"
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Oppgavetittel..."
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Beskrivelse:</label>
                      <textarea
                        className="form-input"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Beskrivelse av oppgaven..."
                        rows={3}
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Prioritet:</label>
                      <select
                        className="form-input"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <option value="low">Lav</option>
                        <option value="medium">Medium</option>
                        <option value="high">Høy</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tildelt til:</label>
                      <select
                        className="form-input"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <option value="">Velg person...</option>
                        {familyMembers.map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Forfallsdato:</label>
                      <input
                        className="form-input"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        style={{ marginBottom: '0.5rem' }}
                      />
                    </div>

                    {/* Huskeliste */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Huskeliste</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={projectTaskReminderInput}
                          onChange={(e) => setProjectTaskReminderInput(e.target.value)}
                          placeholder="Legg til huskeliste element"
                          style={{ flex: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addProjectTaskReminder();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={addProjectTaskReminder}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          +
                        </button>
                      </div>

                      {newTask.reminders.length > 0 && (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem' }}>
                          {newTask.reminders.map(reminder => (
                            <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                              <span style={{ fontSize: '0.875rem' }}>{reminder.text}</span>
                              <button
                                type="button"
                                onClick={() => removeProjectTaskReminder(reminder.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTask({
                            title: '',
                            description: '',
                            priority: 'medium',
                            assignedTo: '',
                            dueDate: '',
                            completed: false,
                            reminders: []
                          });
                          setProjectTaskReminderInput('');
                        }}
                      >
                        Avbryt
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (!newTask.title.trim()) return;

                          const task = {
                            id: Date.now() + Math.random(),
                            ...newTask,
                            completed: false
                          };

                          // Add task to project
                          setProjectTasks(prev => ({
                            ...prev,
                            [selectedProject.id]: [...(prev[selectedProject.id] || []), task]
                          }));

                          // Update project task count and progress
                          const currentTasks = projectTasks[selectedProject.id] || [];
                          const newTotalTasks = currentTasks.length + 1;
                          const completedTasks = currentTasks.filter(t => t.completed).length;
                          const newProgress = Math.round((completedTasks / newTotalTasks) * 100);

                          setProjects(projects.map(p =>
                            p.id === selectedProject.id
                              ? { ...p, tasks: newTotalTasks, progress: newProgress }
                              : p
                          ));

                          // Reset form and close modal
                          setShowAddTask(false);
                          setNewTask({
                            title: '',
                            description: '',
                            priority: 'medium',
                            assignedTo: '',
                            dueDate: '',
                            completed: false,
                            reminders: []
                          });
                          setProjectTaskReminderInput('');
                        }}
                        disabled={!newTask.title.trim()}
                      >
                        Legg til oppgave
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setActiveTab('overview')}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  📅 Kalender
                </h1>
              </div>


              {/* Time range filter */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Tidsperiode:
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { id: '1dag', label: '1 dag' },
                    { id: '3dager', label: '3 dager' },
                    { id: '1uke', label: '1 uke' }
                  ].map(period => (
                    <button
                      key={period.id}
                      className={`btn ${timePeriod === period.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => setTimePeriod(period.id)}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather widget */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                  ☀️ Været
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>I dag</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>☀️</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: '500' }}>18°</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>I morgen</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>⛅</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: '500' }}>16°</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>Overmorgen</div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🌧️</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: '500' }}>14°</div>
                  </div>
                </div>
              </div>

              {/* Custody Arrangement Configuration */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                  ⚙️ Samværsordning
                </h3>

                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {/* Arrangement Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Type ordning:
                    </label>
                    <select
                      value={custodyConfig.arrangement}
                      onChange={(e) => setCustodyConfig({...custodyConfig, arrangement: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        background: 'white'
                      }}
                    >
                      <option value="alternating_weeks">Annenhver uke</option>
                      <option value="alternating_weekends">Annenhver helg</option>
                      <option value="every_third_weekend">Hver tredje helg</option>
                      <option value="alternating_long_weekends">Annenhver langhelg</option>
                    </select>
                  </div>

                  {/* Handover Day */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Byttedag:
                    </label>
                    <select
                      value={custodyConfig.handoverDays[0] || ''}
                      onChange={(e) => setCustodyConfig({...custodyConfig, handoverDays: [e.target.value]})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        background: 'white'
                      }}
                    >
                      <option value="monday">Mandag</option>
                      <option value="tuesday">Tirsdag</option>
                      <option value="wednesday">Onsdag</option>
                      <option value="thursday">Torsdag</option>
                      <option value="friday">Fredag</option>
                      <option value="saturday">Lørdag</option>
                      <option value="sunday">Søndag</option>
                    </select>
                  </div>

                  {/* Starts With */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Starter med:
                    </label>
                    <select
                      value={custodyConfig.startsWith}
                      onChange={(e) => setCustodyConfig({...custodyConfig, startsWith: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        background: 'white'
                      }}
                    >
                      <option value="mor">Mor</option>
                      <option value="far">Far</option>
                    </select>
                  </div>

                  {/* Handover Time */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Byttetid:
                    </label>
                    <input
                      type="time"
                      value={custodyConfig.handoverTimes[0] || ''}
                      onChange={(e) => setCustodyConfig({...custodyConfig, handoverTimes: [e.target.value]})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Calendar widget */}
              <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                  📅 Kalender
                </h3>

                {/* Calendar Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      color: '#6b7280'
                    }}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    ‹
                  </button>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    {formatMonth(currentDate)}
                  </h4>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      color: '#6b7280'
                    }}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    ›
                  </button>
                </div>

                {/* Day Headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px',
                  marginBottom: '0.5rem'
                }}>
                  {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map(day => (
                    <div key={day} style={{
                      fontWeight: '600',
                      color: '#6b7280',
                      padding: '0.5rem 0',
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px'
                }}>
                  {getDaysInMonth(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={index} style={{ aspectRatio: '1', minHeight: '32px' }} />;
                    }

                    const personForDate = getPersonForDate(date);
                    const today = isToday(date);
                    const activitiesForDate = getActivitiesForDate(date);
                    const hasActivities = activitiesForDate.length > 0;
                    const isHandover = isHandoverDay(date);
                    const packingTasksForDate = getPackingTasksForDate(date);

                    return (
                      <div
                        key={index}
                        className={`calendar-day ${today ? 'today' : ''}`}
                        style={{
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          position: 'relative',
                          minHeight: '32px',
                          padding: '2px',
                          background: today ? '#3b82f6' : personForDate.color,
                          color: today ? 'white' : '#374151',
                          border: `1px solid ${today ? '#2563eb' : personForDate.borderColor}`
                        }}
                        onClick={() => {
                          // Auto-create packing task if this is a handover day
                          if (isHandover) {
                            createPackingTaskForHandover(date);
                          }

                          const dateFormatted = date.toLocaleDateString('no-NO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                          const custodyOwner = getCustodyOwner(date);
                          const arrangementText = custodyConfig.arrangement === 'alternating_weeks' ? 'uke' :
                                                 custodyConfig.arrangement === 'alternating_weekends' ? 'helg' :
                                                 custodyConfig.arrangement === 'every_third_weekend' ? 'helg' :
                                                 custodyConfig.arrangement === 'alternating_long_weekends' ? 'langhelg' : 'periode';
                          const custodyInfo = `${personForDate.emoji} ${custodyOwner === 'mor' ? 'Mor sin' : 'Far sin'} ${arrangementText}${isHandover ? ' (Byttedag)' : ''}`;

                          // Include both activities and packing tasks
                          const activities = activitiesForDate.map(activity => ({
                            name: activity.title,
                            time: activity.time,
                            type: activity.type === 'recurring' ? 'recurring' : 'single',
                            assignedTo: activity.assignedTo,
                            location: (activity as any).location || '',
                            reminders: activity.reminders
                          }));

                          const packingTasks = packingTasksForDate.map(task => ({
                            name: task.title,
                            time: custodyConfig.handoverTimes[0] || '15:00',
                            type: 'packing',
                            assignedTo: 'Familie',
                            location: '',
                            checklist: task.checklist,
                            reminders: []
                          }));

                          const allActivities = [...activities, ...packingTasks];

                          setSelectedCalendarDay({
                            date: dateFormatted,
                            custodyInfo,
                            activities: allActivities,
                            hasActivities: allActivities.length > 0,
                            person: personForDate,
                            isHandover,
                            packingTasks: packingTasksForDate
                          });
                        }}
                      >
                        <span style={{ fontWeight: today ? '600' : '500' }}>
                          {date.getDate()}
                        </span>
                        {/* Handover day indicator */}
                        {isHandover && (
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#f59e0b',
                            border: '1px solid white',
                            fontSize: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            📦
                          </div>
                        )}
                        {/* Activity indicator */}
                        {(hasActivities || packingTasksForDate.length > 0) && (
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            marginTop: '2px',
                            background: today ? 'rgba(255,255,255,0.8)' : personForDate.borderColor
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custody Legend */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      background: '#fce7f3',
                      borderRadius: '3px',
                      border: '1px solid #ec4899'
                    }} />
                    <span style={{ fontWeight: '500' }}>👩 Mor sine uker</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      background: '#e0f2fe',
                      borderRadius: '3px',
                      border: '1px solid #0284c7'
                    }} />
                    <span style={{ fontWeight: '500' }}>👨 Far sine uker</span>
                  </div>
                </div>
              </div>

              {/* Selected Calendar Day Expanded Content */}
              {selectedCalendarDay && (
                <div style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        📅 {selectedCalendarDay.date}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        👥 {selectedCalendarDay.custodyInfo}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCalendarDay(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {selectedCalendarDay.hasActivities ? (
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Aktiviteter:</h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {selectedCalendarDay.activities.map((activity, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.75rem',
                              background: '#f8fafc',
                              borderRadius: '0.5rem',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                            onClick={() => alert(`Klikket på aktivitet: ${activity.name} (${activity.time})`)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '500' }}>{activity.name}</span>
                              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{activity.time}</span>
                            </div>
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                background: activity.type === 'barnehage' ? '#fef3c7' : activity.type === 'sport' ? '#dbeafe' : '#f3e8ff',
                                color: activity.type === 'barnehage' ? '#92400e' : activity.type === 'sport' ? '#1e40af' : '#6b21a8'
                              }}>
                                {activity.type === 'barnehage' ? '🏫 Barnehage' : activity.type === 'sport' ? '⚽ Sport' : '👨‍👩‍👧‍👦 Familie'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                      <p>Ingen spesielle aktiviteter denne dagen.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>💡 Klikk på familiefiltrene for å se spesifikke aktiviteter!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'work-school' && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setActiveTab('overview')}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  🏫 Skole/Arbeid
                </h1>
              </div>

              {/* Activities List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    Aktiviteter ({workSchoolActivities.length})
                  </h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddWorkSchoolActivity(true)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    + Legg til aktivitet
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {workSchoolActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="card"
                      onClick={() => setSelectedActivity(activity)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {activity.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>⏰ {activity.time}</span>
                            <span>👤 {activity.assignedTo}</span>
                            {activity.type === 'recurring' && <span>🔄 {activity.schedule.replace('every_', '').replace('_', ' ')}</span>}
                            {activity.type === 'single' && <span>📅 {activity.date}</span>}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: activity.type === 'recurring' ? '#fef3c7' : '#dbeafe',
                            color: activity.type === 'recurring' ? '#b45309' : '#1e40af'
                          }}
                        >
                          {activity.type === 'recurring' ? 'Gjentakende' : 'Engangs'}
                        </div>
                      </div>

                      {/* Reminder checklist */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                          Huskeliste:
                        </h4>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                          {activity.reminders.map(reminder => (
                            <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={reminder.completed}
                                onChange={() => {
                                  const updatedActivities = workSchoolActivities.map(act => {
                                    if (act.id === activity.id) {
                                      return {
                                        ...act,
                                        reminders: act.reminders.map(rem =>
                                          rem.id === reminder.id ? { ...rem, completed: !rem.completed } : rem
                                        )
                                      };
                                    }
                                    return act;
                                  });
                                  setWorkSchoolActivities(updatedActivities);
                                }}
                                style={{ marginRight: '0.5rem' }}
                              />
                              <span style={{
                                fontSize: '0.875rem',
                                textDecoration: reminder.completed ? 'line-through' : 'none',
                                color: reminder.completed ? '#6b7280' : '#374151'
                              }}>
                                {reminder.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {workSchoolActivities.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    <p>Ingen skole/arbeid aktiviteter lagt til ennå.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Klikk "Legg til aktivitet" for å komme i gang!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leisure' && (
            <div>
              {/* Header with back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  onClick={() => setActiveTab('overview')}
                >
                  ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  ⚽ Fritidsaktiviteter
                </h1>
              </div>

              {/* Activities List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    Aktiviteter ({leisureActivities.length})
                  </h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddLeisureActivity(true)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    + Legg til aktivitet
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {leisureActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="card"
                      onClick={() => setSelectedActivity(activity)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {activity.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>⏰ {activity.time}</span>
                            <span>👤 {activity.assignedTo}</span>
                            {activity.location && <span>📍 {activity.location}</span>}
                            {activity.type === 'recurring' && <span>🔄 {activity.schedule.replace('every_', '').replace('_', ' ')}</span>}
                            {activity.type === 'single' && <span>📅 {activity.date}</span>}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: activity.type === 'recurring' ? '#fef3c7' : '#dbeafe',
                            color: activity.type === 'recurring' ? '#b45309' : '#1e40af'
                          }}
                        >
                          {activity.type === 'recurring' ? 'Gjentakende' : 'Engangs'}
                        </div>
                      </div>

                      {/* Reminder checklist */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                          Huskeliste:
                        </h4>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                          {activity.reminders.map(reminder => (
                            <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={reminder.completed}
                                onChange={() => {
                                  const updatedActivities = leisureActivities.map(act => {
                                    if (act.id === activity.id) {
                                      return {
                                        ...act,
                                        reminders: act.reminders.map(rem =>
                                          rem.id === reminder.id ? { ...rem, completed: !rem.completed } : rem
                                        )
                                      };
                                    }
                                    return act;
                                  });
                                  setLeisureActivities(updatedActivities);
                                }}
                                style={{ marginRight: '0.5rem' }}
                              />
                              <span style={{
                                fontSize: '0.875rem',
                                textDecoration: reminder.completed ? 'line-through' : 'none',
                                color: reminder.completed ? '#6b7280' : '#374151'
                              }}>
                                {reminder.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {leisureActivities.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    <p>Ingen fritidsaktiviteter lagt til ennå.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Klikk "Legg til aktivitet" for å komme i gang!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                👨‍👩‍👧‍👦 Familie
              </h1>

              {/* Family Group Setup */}
              {!hasFamily ? (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    🏠 Sett opp din familiegruppe
                  </h2>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    For å bruke Familie TODO må du opprette en familiegruppe og invitere andre familiemedlemmer.
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowFamilySetup(true)}
                      style={{ minWidth: '200px' }}
                    >
                      🔗 Opprett familiegruppe
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        const inviteCode = prompt('Skriv inn invitasjonskode:');
                        if (inviteCode) joinFamilyGroup(inviteCode);
                      }}
                      style={{ minWidth: '200px' }}
                    >
                      📧 Bli med i familie
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Family Members Overview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    Familiemedlemmer ({familyMembers.length})
                  </h2>
                  {hasFamily ? (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        setShowInviteMembers(true);
                      }}
                    >
                      📧 Inviter familiemedlem
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        setShowAddMember(true);
                      }}
                    >
                      + Legg til person
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {familyMembers.map(member => (
                    <div key={member.id} className="card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            flex: 1,
                            padding: '0.25rem',
                            borderRadius: '0.5rem',
                            transition: 'background-color 0.2s',
                            backgroundColor: selectedMember?.id === member.id ? '#f0f9ff' : 'transparent'
                          }}
                          onClick={() => {
                            console.log('Family member clicked:', member.name);
                            setSelectedMember(selectedMember?.id === member.id ? null : member);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = selectedMember?.id === member.id ? '#f0f9ff' : '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedMember?.id === member.id ? '#f0f9ff' : 'transparent';
                          }}
                        >
                          <ProfileDisplay member={member} size="48px" showName={false} />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                              {member.name}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                              {member.role ? (() => {
                                const roleNames = {
                                  mor: 'Mor',
                                  far: 'Far',
                                  barn: 'Barn',
                                  venn: 'Venn'
                                };
                                return roleNames[member.role] || 'Familiemedlem';
                              })() : 'Familiemedlem'} • Klikk for å se oppgaver
                            </p>
                          </div>
                          <div style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            transition: 'transform 0.2s',
                            transform: selectedMember?.id === member.id ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>
                            ▼
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => openEditMember(member)}
                          >
                            ✏️ Rediger
                          </button>
                          {familyMembers.length > 1 && (
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8rem',
                                background: '#fef2f2',
                                borderColor: '#fecaca',
                                color: '#dc2626'
                              }}
                              onClick={() => {
                                if (confirm(`Er du sikker på at du vil fjerne ${member.name} fra familien?`)) {
                                  setFamilyMembers(familyMembers.filter(m => m.id !== member.id));
                                }
                              }}
                            >
                              🗑️ Fjern
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Member Tasks */}
              {selectedMember && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Oppgaver for <ProfileDisplay member={selectedMember} size="24px" showName={true} />
                  </h2>

                  {(() => {
                    const memberTasks = getTasksForMember(selectedMember.name);

                    if (memberTasks.total === 0) {
                      return (
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                            {selectedMember.name} har ingen oppgaver for øyeblikket.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Standalone Tasks */}
                        {memberTasks.standalone.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                              Selvstendige oppgaver ({memberTasks.standalone.length})
                            </h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {memberTasks.standalone.sort((a, b) => Number(a.completed) - Number(b.completed)).map(task => (
                                <div
                                  key={task.id}
                                  className="card"
                                  style={{
                                    padding: '0.75rem',
                                    opacity: task.completed ? 0.7 : 1,
                                    borderLeft: task.completed ? '4px solid #16a34a' :
                                      task.priority === 'high' ? '4px solid #dc2626' :
                                      task.priority === 'medium' ? '4px solid #f59e0b' : '4px solid #6b7280'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                      <h4 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#6b7280' : '#111827'
                                      }}>
                                        {task.completed ? '✅' : '📋'} {task.title}
                                      </h4>
                                      <p style={{
                                        fontSize: '0.8rem',
                                        color: '#6b7280',
                                        margin: '0.25rem 0 0 0',
                                        textDecoration: task.completed ? 'line-through' : 'none'
                                      }}>
                                        {task.description}
                                      </p>
                                      {task.dueDate && (
                                        <p style={{
                                          fontSize: '0.75rem',
                                          color: task.completed ? '#6b7280' :
                                            new Date(task.dueDate) < new Date() ? '#dc2626' : '#374151',
                                          margin: '0.25rem 0 0 0',
                                          fontWeight: new Date(task.dueDate) < new Date() && !task.completed ? '600' : '400'
                                        }}>
                                          📅 {new Date(task.dueDate).toLocaleDateString('no-NO')}
                                          {new Date(task.dueDate) < new Date() && !task.completed && ' (Forfalt)'}
                                        </p>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                                        color: task.priority === 'high' ? '#b91c1c' : task.priority === 'medium' ? '#b45309' : '#15803d',
                                        border: `2px solid ${task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'}`
                                      }}>
                                        {task.priority === 'high' ? 'HØY' :
                                         task.priority === 'medium' ? 'MEDIUM' : 'LAV'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Project Tasks */}
                        {memberTasks.project.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                              Prosjektoppgaver ({memberTasks.project.length})
                            </h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {memberTasks.project.sort((a, b) => a.completed - b.completed).map(task => (
                                <div
                                  key={`project-${task.id}`}
                                  className="card"
                                  style={{
                                    padding: '0.75rem',
                                    opacity: task.completed ? 0.7 : 1,
                                    borderLeft: task.completed ? '4px solid #16a34a' :
                                      task.priority === 'high' ? '4px solid #dc2626' :
                                      task.priority === 'medium' ? '4px solid #f59e0b' : '4px solid #6b7280'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{
                                          padding: '0.125rem 0.375rem',
                                          borderRadius: '0.25rem',
                                          fontSize: '0.7rem',
                                          fontWeight: '500',
                                          background: '#f3e8ff',
                                          color: '#8b5cf6'
                                        }}>
                                          📁 {task.projectName}
                                        </span>
                                      </div>
                                      <h4 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#6b7280' : '#111827'
                                      }}>
                                        {task.completed ? '✅' : '📋'} {task.title}
                                      </h4>
                                      <p style={{
                                        fontSize: '0.8rem',
                                        color: '#6b7280',
                                        margin: '0.25rem 0 0 0',
                                        textDecoration: task.completed ? 'line-through' : 'none'
                                      }}>
                                        {task.description}
                                      </p>
                                      {task.dueDate && (
                                        <p style={{
                                          fontSize: '0.75rem',
                                          color: task.completed ? '#6b7280' :
                                            new Date(task.dueDate) < new Date() ? '#dc2626' : '#374151',
                                          margin: '0.25rem 0 0 0',
                                          fontWeight: new Date(task.dueDate) < new Date() && !task.completed ? '600' : '400'
                                        }}>
                                          📅 {new Date(task.dueDate).toLocaleDateString('no-NO')}
                                          {new Date(task.dueDate) < new Date() && !task.completed && ' (Forfalt)'}
                                        </p>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fef3c7' : '#ecfdf5',
                                        color: task.priority === 'high' ? '#b91c1c' : task.priority === 'medium' ? '#b45309' : '#15803d',
                                        border: `2px solid ${task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'}`
                                      }}>
                                        {task.priority === 'high' ? 'HØY' :
                                         task.priority === 'medium' ? 'MEDIUM' : 'LAV'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Family Statistics */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Familiestatistikk
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card" style={{ padding: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Totale oppgaver
                    </h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {familyMembers.length * 3}
                    </p>
                  </div>
                  <div className="card" style={{ padding: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Aktive prosjekter
                    </h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                      3
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Hurtighandlinger
                </h2>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => alert('Planlegg familieaktivitet (funksjon kommer snart)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎯</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Planlegg familieaktivitet
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Opprett nye aktiviteter for hele familien
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    className="card"
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => setActiveTab('calendar')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📅</span>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          Se familiekalender
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Oversikt over alle familieaktiviteter
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ⚙️ Innstillinger
              </h1>

              {/* Custody Arrangement Configuration */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                  📅 Samværsordning
                </h2>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Arrangement Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                      Type samværsordning
                    </label>
                    <select
                      value={custodyConfig.arrangement}
                      onChange={(e) => autoConfigureHandoverDays(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="alternating_weeks">Annenhver uke</option>
                      <option value="alternating_weekends">Annenhver helg</option>
                      <option value="every_third_weekend">Hver tredje helg</option>
                      <option value="alternating_long_weekends">Annenhver langhelg</option>
                    </select>
                  </div>

                  {/* Multiple Handover Days */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                      Byttedager og tidspunkt
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {custodyConfig.handoverDays.map((day, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            value={day}
                            onChange={(e) => updateHandoverDay(index, e.target.value)}
                            style={{
                              flex: '1',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              background: 'white'
                            }}
                          >
                            <option value="monday">Mandag</option>
                            <option value="tuesday">Tirsdag</option>
                            <option value="wednesday">Onsdag</option>
                            <option value="thursday">Torsdag</option>
                            <option value="friday">Fredag</option>
                            <option value="saturday">Lørdag</option>
                            <option value="sunday">Søndag</option>
                          </select>

                          <input
                            type="time"
                            value={custodyConfig.handoverTimes[index]}
                            onChange={(e) => updateHandoverTime(index, e.target.value)}
                            style={{
                              width: '120px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              background: 'white'
                            }}
                          />

                          {custodyConfig.handoverDays.length > 1 && (
                            <button
                              onClick={() => removeHandoverDay(index)}
                              style={{
                                padding: '0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      {custodyConfig.handoverDays.length < 3 && (
                        <button
                          onClick={addHandoverDay}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            alignSelf: 'flex-start'
                          }}
                        >
                          + Legg til byttedag
                        </button>
                      )}

                      <button
                        onClick={() => autoConfigureHandoverDays(custodyConfig.arrangement)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          alignSelf: 'flex-start'
                        }}
                      >
                        🔄 Auto-konfigurer
                      </button>
                    </div>
                  </div>

                  {/* Who Starts */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                      Hvem starter syklusen
                    </label>
                    <select
                      value={custodyConfig.startsWith}
                      onChange={(e) => setCustodyConfig(prev => ({ ...prev, startsWith: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="mor">Mor starter</option>
                      <option value="far">Far starter</option>
                    </select>
                  </div>
                </div>

                {/* Current Configuration Display */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#4b5563'
                }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    📋 Gjeldende konfigurasjon:
                  </h3>
                  <p style={{ margin: '0.25rem 0' }}>
                    • Type: {custodyConfig.arrangement === 'alternating_weeks' ? 'Annenhver uke' :
                              custodyConfig.arrangement === 'alternating_weekends' ? 'Annenhver helg' :
                              custodyConfig.arrangement === 'every_third_weekend' ? 'Hver tredje helg' :
                              'Annenhver langhelg'}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    • Byttedager: {custodyConfig.handoverDays.map((day, index) => {
                      const dayName = day === 'monday' ? 'Mandag' :
                                      day === 'tuesday' ? 'Tirsdag' :
                                      day === 'wednesday' ? 'Onsdag' :
                                      day === 'thursday' ? 'Torsdag' :
                                      day === 'friday' ? 'Fredag' :
                                      day === 'saturday' ? 'Lørdag' : 'Søndag';
                      return `${dayName} (${custodyConfig.handoverTimes[index]})`;
                    }).join(', ')}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    • Starter med: {custodyConfig.startsWith === 'mor' ? 'Mor' : 'Far'}
                  </p>
                </div>
              </div>

              {/* Packing Tasks Configuration */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                  📦 Pakkeliste-mal
                </h2>

                {/* Info about automatic packing tasks */}
                <div style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  borderRadius: '0.5rem',
                  border: '1px solid #f59e0b',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      Automatiske pakke-oppgaver
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0 }}>
                    På byttedager opprettes automatisk pakke-oppgaver med din tilpassede huskeliste.
                    Dette gjøres på: {custodyConfig.handoverDays.map((day, index) => {
                      const dayName = day === 'monday' ? 'mandag' :
                                      day === 'tuesday' ? 'tirsdag' :
                                      day === 'wednesday' ? 'onsdag' :
                                      day === 'thursday' ? 'torsdag' :
                                      day === 'friday' ? 'fredag' :
                                      day === 'saturday' ? 'lørdag' : 'søndag';
                      return `${dayName} kl. ${custodyConfig.handoverTimes[index]}`;
                    }).join(', ')}.
                  </p>
                </div>

                {/* Packing list template manager */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                    📝 Rediger pakkeliste-mal
                  </h3>

                  {/* Add new item */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      value={newPackingItem}
                      onChange={(e) => setNewPackingItem(e.target.value)}
                      placeholder="Legg til ny pakkelistepunkt..."
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addPackingItem()}
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="klær">Klær</option>
                      <option value="hygiene">Hygiene</option>
                      <option value="leker">Leker</option>
                      <option value="skole">Skole</option>
                      <option value="helse">Helse</option>
                      <option value="teknologi">Teknologi</option>
                      <option value="annet">Annet</option>
                    </select>
                    <button
                      onClick={addPackingItem}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Legg til
                    </button>
                  </div>

                  {/* Template items by category */}
                  {['klær', 'hygiene', 'leker', 'skole', 'helse', 'teknologi', 'annet'].map(category => {
                    const categoryItems = packingTemplate.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    const categoryLabels = {
                      klær: '👕 Klær',
                      hygiene: '🧼 Hygiene',
                      leker: '🧸 Leker',
                      skole: '📚 Skole',
                      helse: '💊 Helse',
                      teknologi: '📱 Teknologi',
                      annet: '📋 Annet'
                    };

                    return (
                      <div key={category} style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>
                          {categoryLabels[category]}
                        </h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {categoryItems.map(item => (
                            <div key={item.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              background: item.enabled ? '#f9fafb' : '#f3f4f6',
                              borderRadius: '0.375rem',
                              border: '1px solid ' + (item.enabled ? '#e5e7eb' : '#d1d5db')
                            }}>
                              <input
                                type="checkbox"
                                checked={item.enabled}
                                onChange={() => togglePackingTemplateItem(item.id)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{
                                flex: 1,
                                fontSize: '0.875rem',
                                color: item.enabled ? '#374151' : '#6b7280',
                                textDecoration: item.enabled ? 'none' : 'line-through'
                              }}>
                                {item.item}
                              </span>
                              <button
                                onClick={() => removePackingTemplateItem(item.id)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#f3f4f6',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <strong>{packingTemplate.filter(item => item.enabled).length}</strong> aktive punkter i pakkeliste-malen.
                    Disse vil bli inkludert i automatiske pakke-oppgaver.
                  </div>
                </div>
              </div>

              {/* App Information */}
              <div className="card">
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                  ℹ️ App-informasjon
                </h2>

                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Versjon:</span>
                    <span style={{ fontWeight: '500' }}>1.0.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Database:</span>
                    <span style={{ fontWeight: '500', color: '#16a34a' }}>✅ Tilkoblet</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Siste oppdatering:</span>
                    <span style={{ fontWeight: '500' }}>Oktober 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button with Menu */}
      <div className="floating-action-container" style={{
        position: 'fixed',
        bottom: '1rem',
        ...(notificationButtonPosition === 'right' ? { right: '1rem' } : { left: '1rem' }),
        zIndex: 1005
      }}>
        {/* Floating Menu Overlay */}
        {showFloatingMenu && (
          <div
            className="floating-menu-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              background: 'transparent'
            }}
            onClick={() => setShowFloatingMenu(false)}
          />
        )}

        {/* Floating Menu Items */}
        {showFloatingMenu && (
          <div className="floating-menu" style={{
            position: 'absolute',
            bottom: '5rem',
            ...(notificationButtonPosition === 'right' ? { right: 0 } : { left: 0 }),
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 1001,
            minWidth: '12rem'
          }}>
            <button
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                setActiveTab('tasks');
                setShowAddStandaloneTask(true);
                setShowFloatingMenu(false);
              }}
            >
              📝 Legg til oppgave
            </button>
            <button
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                setActiveTab('projects');
                setShowAddProject(true);
                setShowFloatingMenu(false);
              }}
            >
              📁 Legg til prosjekt
            </button>
            <button
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                setActivityType('work-school');
                setShowAddWorkSchoolActivity(true);
                setShowFloatingMenu(false);
              }}
            >
              🏫 Skole/Arbeid aktivitet
            </button>
            <button
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                setActivityType('leisure');
                setShowAddLeisureActivity(true);
                setShowFloatingMenu(false);
              }}
            >
              ⚽ Fritidsaktivitet
            </button>
          </div>
        )}

        {/* Add Family Member Modal - Positioned at component level for proper z-index */}
        {showAddMember && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddMember(false);
                setNewMemberName('');
                setNewMemberRole('');
              }
            }}
          >
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Legg til familiemedlem
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Navn:</label>
                <input
                  className="form-input"
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Skriv navn..."
                  style={{ marginBottom: '0.5rem' }}
                  onKeyPress={(e) => e.key === 'Enter' && newMemberRole.trim() && addFamilyMember()}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Rolle:</label>
                <select
                  className="form-input"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="">Velg rolle...</option>
                  <option value="mor">👩 Mor</option>
                  <option value="far">👨 Far</option>
                  <option value="barn">👧 Barn</option>
                  <option value="venn">👥 Venn</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                    setNewMemberRole('');
                  }}
                >
                  Avbryt
                </button>
                <button
                  className="btn btn-primary"
                  onClick={addFamilyMember}
                  disabled={!newMemberName.trim() || !newMemberRole.trim()}
                >
                  Legg til
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          className="btn btn-primary floating-button"
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            fontSize: '1.5rem',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: showFloatingMenu ? 'rotate(45deg)' : 'rotate(0deg)',
            position: 'fixed',
            bottom: '1rem',
            ...(notificationButtonPosition === 'right' ? { right: '1rem' } : { left: '1rem' })
          }}
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
        >
          +
        </button>
      </div>

      {/* Activity Form Modals */}
      {(showAddWorkSchoolActivity || showAddLeisureActivity) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddWorkSchoolActivity(false);
              setShowAddLeisureActivity(false);
              setNewActivity({
                title: '',
                assignedTo: 'Emma',
                type: 'recurring',
                schedule: 'every_tuesday',
                time: '17:00',
                date: '',
                location: '',
                reminders: [],
                reminderTime: '1_hour_before',
                notes: ''
              });
              setReminderInput('');
            }
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              {activityType === 'work-school' ? '🏫 Ny Skole/Arbeid Aktivitet' : '⚽ Ny Fritidsaktivitet'}
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitActivity(); }}>
              {/* Aktivitetsnavn */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Hva heter aktiviteten?</label>
                <input
                  type="text"
                  className="form-input"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="f.eks. Gym på skolen, Fotball trening"
                  required
                />
              </div>

              {/* For hvem */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">For hvem?</label>
                <select
                  className="form-input"
                  value={newActivity.assignedTo}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, assignedTo: e.target.value }))}
                >
                  {familyMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Hvor ofte */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Hvor ofte?</label>
                <select
                  className="form-input"
                  value={newActivity.type}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="recurring">Ukentlig</option>
                  <option value="single">Engangs</option>
                </select>
              </div>

              {/* Dato/Tidspunkt */}
              {newActivity.type === 'recurring' ? (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Hvilken dag?</label>
                  <select
                    className="form-input"
                    value={newActivity.schedule}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, schedule: e.target.value }))}
                  >
                    <option value="every_monday">Hver mandag</option>
                    <option value="every_tuesday">Hver tirsdag</option>
                    <option value="every_wednesday">Hver onsdag</option>
                    <option value="every_thursday">Hver torsdag</option>
                    <option value="every_friday">Hver fredag</option>
                    <option value="every_saturday">Hver lørdag</option>
                    <option value="every_sunday">Hver søndag</option>
                  </select>
                </div>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Dato</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Klokkeslett</label>
                <input
                  type="time"
                  className="form-input"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              {/* Lokasjon (kun fritidsaktiviteter) */}
              {activityType === 'leisure' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Lokasjon (valgfritt)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="f.eks. Karuss, Stadion"
                  />
                </div>
              )}

              {/* Påminnelse */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Påminnelse</label>
                <select
                  className="form-input"
                  value={newActivity.reminderTime}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, reminderTime: e.target.value }))}
                >
                  <option value="1_hour_before">1 time før</option>
                  <option value="evening_before">Kvelden før kl. 19:00</option>
                  <option value="none">Ingen påminnelse</option>
                </select>
              </div>

              {/* Huskeliste */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Huskeliste</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={reminderInput}
                    onChange={(e) => setReminderInput(e.target.value)}
                    placeholder="Legg til huskeliste element"
                    style={{ flex: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addReminder();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addReminder}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    +
                  </button>
                </div>

                {newActivity.reminders.length > 0 && (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    {newActivity.reminders.map(reminder => (
                      <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                        <span style={{ fontSize: '0.875rem' }}>{reminder.text}</span>
                        <button
                          type="button"
                          onClick={() => removeReminder(reminder.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notater */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Notater (valgfritt)</label>
                <textarea
                  className="form-input"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ekstra informasjon..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Knapper */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddWorkSchoolActivity(false);
                    setShowAddLeisureActivity(false);
                    setNewActivity({
                      title: '',
                      assignedTo: 'Emma',
                      type: 'recurring',
                      schedule: 'every_tuesday',
                      time: '17:00',
                      date: '',
                      location: '',
                      reminders: [],
                      reminderTime: '1_hour_before',
                      notes: ''
                    });
                    setReminderInput('');
                  }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newActivity.title.trim()}
                >
                  Opprett aktivitet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                Oppgavedetaljer
              </h3>
              <button
                onClick={() => setShowTaskDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Task Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                {selectedTask.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`priority-${selectedTask.priority}`} style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}>
                  {selectedTask.priority === 'high' ? 'Høy' : selectedTask.priority === 'medium' ? 'Middels' : 'Lav'} prioritet
                </span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  backgroundColor: selectedTask.completed ? '#ecfdf5' : '#fef3c7',
                  color: selectedTask.completed ? '#15803d' : '#b45309',
                  border: selectedTask.completed ? '1px solid #22c55e' : '1px solid #f59e0b'
                }}>
                  {selectedTask.completed ? '✓ Fullført' : '⏳ Pågående'}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Beskrivelse
                </h5>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Task Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {selectedTask.assignedTo && (
                  <div>
                    <h6 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                      Tildelt til
                    </h6>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {selectedTask.assignedTo}
                    </p>
                  </div>
                )}
                {selectedTask.dueDate && (
                  <div>
                    <h6 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                      Forfallsdato
                    </h6>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(selectedTask.dueDate).toLocaleDateString('no-NO')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reminders/Huskeliste */}
            {selectedTask.reminders && selectedTask.reminders.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                  📝 Huskeliste
                </h5>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  {selectedTask.reminders.map((reminder, index) => (
                    <div key={reminder.id || index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 0',
                      borderBottom: index < selectedTask.reminders.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: reminder.completed ? '#6b7280' : '#374151',
                        textDecoration: reminder.completed ? 'line-through' : 'none'
                      }}>
                        {reminder.text}
                      </span>
                      {reminder.completed && (
                        <span style={{ marginLeft: '0.5rem', color: '#22c55e', fontSize: '0.875rem' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowTaskDetail(false)}
              >
                Lukk
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Toggle completion status
                  if (selectedTask.taskType === 'project') {
                    // Update project task
                    setProjectTasks(prev => ({
                      ...prev,
                      [selectedProject.id]: prev[selectedProject.id].map(task =>
                        task.id === selectedTask.id
                          ? { ...task, completed: !task.completed }
                          : task
                      )
                    }));
                  } else {
                    // Update standalone task
                    setStandaloneTasks(prev => prev.map(task =>
                      task.id === selectedTask.id
                        ? { ...task, completed: !task.completed }
                        : task
                    ));
                  }

                  // Update selected task for immediate UI feedback
                  setSelectedTask(prev => ({ ...prev, completed: !prev.completed }));
                }}
              >
                {selectedTask.completed ? 'Marker som ikke fullført' : 'Marker som fullført'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Opprett nytt prosjekt
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Tittel:</label>
              <input
                className="form-input"
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Prosjekt tittel"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Beskrivelse:</label>
              <textarea
                className="form-input"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskrivelse av prosjektet"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Kategori:</label>
              <select
                className="form-input"
                value={newProject.category}
                onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="familie">👨‍👩‍👧‍👦 Familie</option>
                <option value="hjem">🏠 Hjem</option>
                <option value="jobb">💼 Jobb</option>
                <option value="ferie">🌴 Ferie</option>
                <option value="annet">📝 Annet</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddProject(false);
                  setNewProject({ title: '', description: '', priority: 'medium', assignedTo: [], dueDate: '', category: 'familie' });
                }}
              >
                Avbryt
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (newProject.title.trim()) {
                    const project = {
                      id: Date.now(),
                      title: newProject.title.trim(),
                      description: newProject.description.trim(),
                      category: newProject.category,
                      status: 'active',
                      progress: 0,
                      tasks: 0,
                      completedTasks: 0,
                      priority: newProject.priority,
                      assignedTo: newProject.assignedTo,
                      dueDate: newProject.dueDate
                    };
                    setProjects(prev => [...prev, project]);
                    setShowAddProject(false);
                    setNewProject({ title: '', description: '', priority: 'medium', assignedTo: [], dueDate: '', category: 'familie' });
                  }
                }}
                disabled={!newProject.title.trim()}
              >
                Opprett prosjekt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Group Setup Modal */}
      {showFamilySetup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFamilySetup(false);
            }
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
              🏠 Opprett familiegruppe
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              createFamilyGroup();
            }}>
              {/* Familiegruppe navn */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Hva skal familiegruppen hete?
                </label>
                <input
                  type="text"
                  value={familyGroupName}
                  onChange={(e) => setFamilyGroupName(e.target.value)}
                  placeholder="f.eks. Familie Hansen, Vårt hjem"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              {/* Din rolle */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Din rolle i familiegruppen
                </label>
                <select
                  value={currentUserRole}
                  onChange={(e) => setCurrentUserRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="mor">👩 Mor</option>
                  <option value="far">👨 Far</option>
                </select>
              </div>

              {/* Info om invitasjoner */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>💡</span>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, color: '#0c4a6e' }}>
                    Etter opprettelse
                  </h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#0c4a6e', margin: 0 }}>
                  Du vil få mulighet til å invitere andre familiemedlemmer til gruppen etter at den er opprettet.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowFamilySetup(false);
                    setFamilyGroupName('');
                  }}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!familyGroupName.trim()}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  🔗 Opprett familiegruppe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteMembers && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInviteMembers(false);
            }
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
              📧 Inviter familiemedlem
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              inviteFamilyMember();
            }}>
              {/* Telefonnummer */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Telefonnummer til familiemedlem
                </label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="f.eks. +47 123 45 678"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              {/* Info om invitasjon */}
              <div style={{
                background: '#fefce8',
                border: '1px solid #eab308',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>📮</span>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, color: '#92400e' }}>
                    Slik fungerer invitasjoner
                  </h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0 }}>
                  En invitasjons-SMS sendes til det oppgitte telefonnummeret. Personen kan bruke linken i SMS-en til å bli med i familiegruppen.
                </p>
              </div>

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: '#374151'
                  }}>
                    🕒 Ventende invitasjoner
                  </h4>
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {pendingInvites.map((invite, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        marginBottom: index < pendingInvites.length - 1 ? '0.5rem' : 0,
                        background: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem'
                      }}>
                        <div>
                          <div>{invite.existingUser ? invite.existingUser.name : invite.phone}</div>
                          {invite.existingUser && (
                            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                              {invite.phone}
                            </div>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#6b7280'
                        }}>
                          {invite.existingUser ? (
                            <>
                              <span>🔔</span>
                              <span>Push-melding</span>
                            </>
                          ) : (
                            <>
                              <span>📱</span>
                              <span>SMS</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowInviteMembers(false);
                    setInvitePhone('');
                  }}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Lukk
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!invitePhone.trim()}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  📱 Send SMS-invitasjon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';

const RatingSection = ({ title = "Rate a Lecturer" }) => {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/lecturers');
        const data = await response.json();
        setLecturers(data);
      } catch (err) {
        console.error('Failed to fetch lecturers:', err);
      }
    };
    fetchLecturers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLecturerId || rating === 0) {
      setMessage('⚠️ Please select a lecturer and give a rating.');
      return;
    }

    
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      setMessage('❌ Please log in to submit a rating.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rated_user_id: selectedLecturerId,
          rated_by_user_id: user.id, 
          rating_value: rating,
          comment: comment || null
        })
      });

      if (response.ok) {
        setMessage('✅ Rating submitted!');
        setRating(0);
        setComment('');
        setSelectedLecturerId('');
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error || 'Failed to submit rating.'}`);
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  return (
    <div className="card p-3 mt-4">
      <h4> {title}</h4>
      {message && <div className="alert alert-info">{message}</div>}
      
      <div className="mb-3">
        <label className="form-label"><strong>Select Lecturer</strong></label>
        <select
          className="form-select"
          value={selectedLecturerId}
          onChange={(e) => setSelectedLecturerId(e.target.value)}
        >
          <option value="">-- Choose a lecturer --</option>
          {lecturers.map(lec => (
            <option key={lec.user_id} value={lec.user_id}>
              {lec.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLecturerId && (
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`btn ${rating >= star ? 'btn-warning' : 'btn-outline-secondary'} me-1`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="mb-2">
            <textarea
              className="form-control"
              placeholder="Comments (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="2"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Submit Rating</button>
        </form>
      )}
    </div>
  );
};

export default RatingSection;
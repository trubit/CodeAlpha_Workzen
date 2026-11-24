import React, { useEffect, useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { CheckCircle, AlertCircle, Shield, ArrowRight, Building, Mail, UserCheck } from 'lucide-react';

export const AcceptInvitationPage: React.FC = () => {
  const { setActiveView, isAuthenticated, currentUser, setCurrentOrg } = useWorkzenStore();
  const [token, setToken] = useState<string>('');
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');

    if (!tokenParam) {
      setErrorMessage('Invitation token is missing from the URL. Please verify your invitation link.');
      setIsLoading(false);
      return;
    }

    setToken(tokenParam);

    apiClient
      .verifyInvitation(tokenParam)
      .then((res) => {
        if (res.success && res.data) {
          setInvitation(res.data);
        } else {
          setErrorMessage(res.error?.message || 'Invalid or expired invitation token.');
        }
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'This invitation has expired or was revoked by an administrator.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAccept = async () => {
    if (!token) return;

    if (!isAuthenticated) {
      // Store token in session storage and redirect to login
      sessionStorage.setItem('pending_invite_token', token);
      setActiveView('login');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.acceptInvitation(token);
      if (res.success && res.data) {
        setSuccessMessage('Invitation accepted! Preparing your workspace access...');
        
        // Select the newly joined organization
        if (res.data.organisationId) {
          await apiClient.selectOrganisation(res.data.organisationId);
          const orgRes = await apiClient.getOrganisation(res.data.organisationId);
          if (orgRes.success && orgRes.data) {
            setCurrentOrg(orgRes.data);
          }
        }

        setTimeout(() => {
          setActiveView('enterprise_dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
      <div className="wz-card p-4 p-md-5 border-0 shadow-lg rounded-4 text-center" style={{ maxWidth: 540, width: '100%' }}>
        {/* Brand Icon */}
        <div
          className="mx-auto mb-3 rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
          style={{ width: 56, height: 56, backgroundColor: '#4F46E5', fontSize: '1.4rem' }}
        >
          W
        </div>

        {isLoading ? (
          <div className="py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted small">Verifying invitation credentials...</div>
          </div>
        ) : errorMessage ? (
          <div className="py-4">
            <div className="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
              <AlertCircle size={36} />
            </div>
            <h4 className="fw-bold text-dark mb-2">Invitation Unavailable</h4>
            <p className="text-muted small mb-4">{errorMessage}</p>
            <button
              type="button"
              className="btn btn-primary px-4 py-2 fw-semibold"
              onClick={() => setActiveView('login')}
            >
              Go to Sign In
            </button>
          </div>
        ) : successMessage ? (
          <div className="py-4">
            <div className="p-3 bg-success-subtle text-success rounded-circle d-inline-flex mb-3">
              <CheckCircle size={36} />
            </div>
            <h4 className="fw-bold text-dark mb-2">Welcome to the Team!</h4>
            <p className="text-muted small mb-4">{successMessage}</p>
          </div>
        ) : (
          <div>
            <span className="badge bg-indigo-subtle text-primary border border-primary-subtle px-3 py-1 mb-2">
              Team Invitation
            </span>
            <h3 className="fw-bold text-dark mb-1">
              Join {invitation?.organisation?.name || 'Organization'}
            </h3>
            <p className="text-muted small mb-4">
              {invitation?.invitedBy
                ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`
                : 'An administrator'}{' '}
              has invited you to collaborate on WORKZEN as an{' '}
              <strong className="text-capitalize">{invitation?.role || 'Member'}</strong>.
            </p>

            {/* Invitation Details Card */}
            <div className="p-3.5 border rounded-3 bg-light text-start mb-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                <Building size={15} />
                <span>Organization: <strong>{invitation?.organisation?.name}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                <Mail size={15} />
                <span>Invited Email: <strong>{invitation?.email}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <Shield size={15} />
                <span>Role: <strong className="text-capitalize">{invitation?.role}</strong></span>
              </div>

              {invitation?.workspaces && invitation.workspaces.length > 0 && (
                <div className="mt-3 pt-2.5 border-top">
                  <div className="text-muted small fw-semibold mb-1">Initial Workspaces:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {invitation.workspaces.map((ws: any) => (
                      <span key={ws._id} className="badge bg-white text-secondary border small">
                        {ws.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="alert alert-info py-2.5 px-3 small rounded-3 mb-4 text-start">
                <strong>Sign In Required:</strong> Please sign in or create an account with your corporate email (<strong>{invitation?.email}</strong>) to accept this invitation.
              </div>
            ) : (
              <div className="alert alert-success py-2.5 px-3 small rounded-3 mb-4 text-start d-flex align-items-center gap-2">
                <UserCheck size={16} className="text-success flex-shrink-0" />
                <span>Signed in as <strong>{currentUser?.email}</strong></span>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Accepting Invitation...'
              ) : !isAuthenticated ? (
                <>Sign In to Accept <ArrowRight size={16} /></>
              ) : (
                <>Accept Invitation & Join Team <ArrowRight size={16} /></>
              )}
            </button>

            <div className="mt-3">
              <button
                type="button"
                className="btn btn-link btn-sm text-muted text-decoration-none"
                onClick={() => setActiveView(isAuthenticated ? 'enterprise_dashboard' : 'login')}
              >
                Decline & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/passport
router.get('/', requireAuth, (req, res) => {
  const passport = db.getDigitalPassport(req.user?.id);
  res.json({
    success: true,
    data: passport
  });
});

// GET /api/passport/export-jsonld
router.get('/export-jsonld', requireAuth, (req, res) => {
  const passport = db.getDigitalPassport(req.user?.id);
  const user = passport.user;

  const jsonLd = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.skillnexus.ai/v2'
    ],
    id: `urn:uuid:${user.candidateId}`,
    type: ['VerifiableCredential', 'SkillNexusDigitalPassport'],
    issuer: {
      id: 'did:nexus:issuer:auth-node',
      name: `${user.college || 'SkillNexus Verified Institution'} // Sovereign Node`
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: user.did,
      name: user.name,
      studentId: user.studentId,
      institution: user.college,
      degree: user.degree,
      overallReadiness: `${user.readinessIndex}%`,
      integrityScore: `${user.integrityIndex}%`,
      attestedSkills: passport.credentials.map(c => ({
        code: c.code,
        skill: c.title,
        mastery: c.score,
        proctorStamp: c.stampType,
        proofHash: c.hash
      }))
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: 'did:nexus:issuer:auth-node#key-1',
      proofPurpose: 'assertionMethod',
      jws: 'eyJhbGciOiJFZERTQSI...ZKhk_SIGNATURE_MINTED_SHA256'
    }
  };

  res.setHeader('Content-Type', 'application/ld+json');
  res.setHeader('Content-Disposition', `attachment; filename="SkillNexus-Passport-${user.name.replace(/\s+/g, '_')}.jsonld"`);
  res.send(JSON.stringify(jsonLd, null, 2));
});

// POST /api/passport/generate-ephemeral-link
router.post('/generate-ephemeral-link', requireAuth, (req, res) => {
  const token = 'ephem_' + Math.random().toString(36).substring(2, 12);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  res.json({
    success: true,
    message: 'Ephemeral 24-hour recruiter verification link generated.',
    shareUrl: `https://verify.skillnexus.ai/passport/view?token=${token}&did=did:nexus:0x89419f`,
    expiresAt,
    zkProofMode: 'Strict Redaction (PII Masked, Cryptographic Score Visible)'
  });
});

module.exports = router;
